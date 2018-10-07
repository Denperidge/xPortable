
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using Nefarius.ViGEm.Client;
using Nefarius.ViGEm.Client.Targets;
using Nefarius.ViGEm.Client.Targets.Xbox360;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace xPortableWindows
{
    class X360 : WebSocketBehavior
    {
        Xbox360Controller controller;
        int port;
        Label lblStatus;
        Button btnDisconnect;
        bool disconnected;
        Xbox360Report report;


        public X360(Xbox360Controller pController, int pPort, Label pLblStatus, Button pBtnDisconnect)
        {
            controller = pController;
            port = pPort;
            lblStatus = pLblStatus;
            btnDisconnect = pBtnDisconnect;
            disconnected = false;
            report = new Xbox360Report();
        }


        protected override void OnOpen()
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                lblStatus.Content = "Connected!";
                btnDisconnect.IsEnabled = true;
                btnDisconnect.Click += Disconnect;
            });
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            string button = e.Data.Split('/')[0];
            string value = e.Data.Split('/')[1];

            // Joysticks
            if (button == "0" || button == "1")
            {
                string[] percentages = value.Split(';');
                switch (button)
                {
                    case "0":
                        report.SetAxis(Xbox360Axes.LeftThumbX, (short)(32767 * int.Parse(percentages[0]) / 100));
                        report.SetAxis(Xbox360Axes.LeftThumbY, (short)(32767 * int.Parse(percentages[1]) / 100));
                        break;
                    case "1":
                        break;
                }
            }
            // LT/RT
            else if (button == "6" || button == "7")
            {
                // If pressed, max value. Else, 0
                short pressed = (value == "1") ? short.MaxValue : (short)0;
                switch (button)
                {
                    case "8":
                        report.SetAxis(Xbox360Axes.LeftTrigger, short.MaxValue);
                        break;
                    case "9":
                        report.SetAxis(Xbox360Axes.RightTrigger, short.MaxValue);
                        break;
                }
            }
            // Buttons
            else
            {
                // If value is 1, button is pressed
                bool pressed = (value == "1") ? true : false;
                switch (button)
                {
                    case "2":
                        report.SetButtonState(Xbox360Buttons.A, pressed);
                        break;
                    case "3":
                        report.SetButtonState(Xbox360Buttons.X, pressed);
                        break;
                    case "4":
                        report.SetButtonState(Xbox360Buttons.B, pressed);
                        break;
                    case "5":
                        report.SetButtonState(Xbox360Buttons.Y, pressed);
                        break;
                    case "8":
                        report.SetButtonState(Xbox360Buttons.LeftShoulder, pressed);
                        break;
                    case "9":
                        report.SetButtonState(Xbox360Buttons.RightShoulder, pressed);
                        break;
                    case "10":
                        report.SetButtonState(Xbox360Buttons.Left, pressed);
                        break;
                    case "11":
                        report.SetButtonState(Xbox360Buttons.Up, pressed);
                        break;
                    case "12":
                        report.SetButtonState(Xbox360Buttons.Right, pressed);
                        break;
                    case "13":
                        report.SetButtonState(Xbox360Buttons.Down, pressed);
                        break;
                    case "14":
                        report.SetButtonState(Xbox360Buttons.LeftThumb, pressed);
                        break;
                    case "15":
                        report.SetButtonState(Xbox360Buttons.RightThumb, pressed);
                        break;
                    case "16":
                        report.SetButtonState(Xbox360Buttons.Start, pressed);
                        break;
                    case "17":
                        report.SetButtonState(Xbox360Buttons.Guide, pressed);
                        break;
                }
            }


            controller.SendReport(report);
        }

        protected override void OnClose(CloseEventArgs e)
        {
            // If not already manually disconnected (thus disconnect through error or the like
            if (!disconnected) Disconnect(null, null);
        }

        private void Disconnect(object sender, RoutedEventArgs e)
        {
            disconnected = true;  // Make sure that onclose doesn't try to disconnect again
            controller.Disconnect();
            Globals.wssv.RemoveWebSocketService("/x360_port" + port);
            Application.Current.Dispatcher.Invoke(() =>
            {
                btnDisconnect.Click -= Disconnect;
                lblStatus.Content = "Not connected";
                btnDisconnect.IsEnabled = false;
            });

        }
    }
}
