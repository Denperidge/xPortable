using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Nefarius.ViGEm.Client;
using Nefarius.ViGEm.Client.Targets;
using Nefarius.ViGEm.Client.Targets.Xbox360;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace xPortableWindows
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        string ip;
        string port;
        HttpListener listener;  // Serve the html/css/js of the controller
        string controllerUI;  // String of html/css/js, the UI for clients


        public MainWindow()
        {
            InitializeComponent();

            port = "7001";  // Default port

            // TODO improve ip fetching and UI
            try
            {
                // Get and save local IP, for the default LAN mode
                using (Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
                {
                    socket.Connect("8.8.8.8", 65530);
                    IPEndPoint endPoint = socket.LocalEndPoint as IPEndPoint;
                    ip = endPoint.Address.ToString();
                }
                // IP has been found, start the HTTPServer
                StartHttpServer();
            }
            catch
            {
                MessageBox.Show("Ip could not be automatically assigned! Please type it manually into the IP box");
                ShowOrHideIp(btnShowOrHideIp, null);  // By default it is hidden, so firing this will show it
            }

            Globals.client = new ViGEmClient();


            Globals.wssv = new WebSocketServer(7000);
            Globals.wssv.AddWebSocketService<connect>("/connect");

            string[] rawHtml = System.IO.File.ReadAllLines("controllerUI/index.html");
            controllerUI = "";
            // TODO more robust controllerUI creation
            foreach (string untrimmedLine in rawHtml)
            {
                string line = untrimmedLine.Trim();

                if (line.StartsWith("<script src=\""))
                {
                    string scriptname = "controllerUI/" + line.Replace("<script src=\"", "").Replace("\"></script>", "");
                    string js =
                        System.IO.File.ReadAllText(scriptname);
                    controllerUI += "<script>" + js + "</script>";
                }
                else if (line.StartsWith("<link rel=\"stylesheet\" href=\""))
                {
                    string scriptname = "controllerUI/" + line.Replace("<link rel=\"stylesheet\" href=\"", "").Replace("\">", "");
                    string css =
                        System.IO.File.ReadAllText(scriptname);
                    controllerUI += "<style>" + css + "</style>";
                }
                else if (line.StartsWith("<img"))
                {
                    // Read SVG
                    string svgname = "controllerUI/" + line.Substring(line.IndexOf("src=\"") + 5).Replace("\"/>", "").Replace("\" />", "");

                    string svg = System.IO.File.ReadAllText(svgname);
                    
                    // The id that should be set, like D_Pad_Down
                    string id = svgname.Split('/')[svgname.Split('/').Length - 1].Replace(".svg", "");

                    

                    // Some SVG's have an id. Remove it, and afterwards add your own
                    string[] splitSvg = System.IO.File.ReadAllLines(svgname);

                    foreach (string rawSvgLine in splitSvg)
                    {
                        string svgLine = rawSvgLine.Trim();
                        // Remove the SVG id attribute if it's there
                        if (svgLine.StartsWith("id="))
                        {
                            svg = svg.Replace(svgLine, "");
                            break;
                        }
                        else if (
                          // If new element (all svg attributes have been assigned), there is no ID to look for
                          svgLine.StartsWith("<") && 
                          !svgLine.StartsWith("<svg") &&  // Don't break on the svg
                          !svgLine.StartsWith("<!--") &&  // or a comment
                          !svgLine.StartsWith("<?xml"))  // or the xml declaration
                            break; 
                    }
                    

                    // Add the new ID
                    svg = svg.Replace("<svg", string.Format( "<svg id={0}", id));

                    controllerUI += svg;
                }
                else controllerUI += line;
            }

            Globals.wssv.Start();
        }

        private void StartHttpServer()
        {
            // If listener has been used before, it should be started. Stop it.
            if (listener != null)
                if (listener.IsListening)
                    listener.Stop();

            listener = new HttpListener();

            string[] ips = ip.Split('/');
            foreach (string ip in ips) listener.Prefixes.Add("http://" + ip.Trim() + ":" + port + "/");

            listener.Start();
            HttpListen();
        }

        async void HttpListen()
        {
            await listener.GetContextAsync().ContinueWith(contextTask =>
            {
                HttpListenerContext context;
                try
                {
                    context = contextTask.Result;
                }
                catch (AggregateException e)
                {
                    // Seems to get called every time the application shuts off
                    return;
                }

                HttpListenerRequest request = context.Request;
                HttpListenerResponse response = context.Response;


                string responseString = controllerUI.Replace("{ip}", request.Url.Host);
                byte[] buffer = Encoding.UTF8.GetBytes(responseString);


                response.ContentLength64 = buffer.Length;
                System.IO.Stream output = response.OutputStream;
                output.Write(buffer, 0, buffer.Length);
                output.Close();
                HttpListen();
            });

        }

        private void ShowOrHideIp(object sender, RoutedEventArgs e)
        {
            Button button = (Button)sender;

            if (((string)button.Content).ToLower().Contains("show"))
            {
                // Show IP, allow edit
                button.Content = "Hide IP";
                txtIp.Text = ip;
                txtPort.Text = port;
                txtIp.IsEnabled = true;
                txtPort.IsEnabled = true;
                btnSaveIpAndPort.IsEnabled = true;
            }
            else
            {
                // Hide IP, no longer allow edit
                btnSaveIpAndPort.IsEnabled = false;
                txtIp.IsEnabled = false;
                txtPort.IsEnabled = false;
                button.Content = "Show IP";
                txtIp.Text = "***.***.***.***";
                txtPort.Text = "****";

            }
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            listener.Stop();
        }

        private void btnSaveIpAndPort_Click(object sender, RoutedEventArgs e)
        {
            ip = txtIp.Text;
            port = txtPort.Text;
            StartHttpServer();
        }
    }
}
