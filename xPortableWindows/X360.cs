
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


        public X360(Xbox360Controller pController, int pPort, Label pLblStatus, Button pBtnDisconnect)
        {
            controller = pController;
            port = pPort;
            lblStatus = pLblStatus;
            btnDisconnect = pBtnDisconnect;
            disconnected = false;
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
            Xbox360Report report = new Xbox360Report();

            string[] buttonPresses = e.Data.Split('_');
            Console.WriteLine("Data: " + e.Data);

            foreach (string buttonPress in buttonPresses)
            {
                if (buttonPress.IsNullOrEmpty()) continue;
                Console.WriteLine("buttonpress: " + buttonPress);
                string button = buttonPress.Split('/')[0];
                string value = buttonPress.Split('/')[1];

                // Joysticks
                if (button == "0" || button == "1")
                {
                    string[] percentages = value.Split(';');
                    switch (button)
                    {
                        case "0":
                            report.SetAxis(Xbox360Axes.LeftThumbX, (short)(32767 * int.Parse(percentages[0]) / 100));
                            report.SetAxis(Xbox360Axes.LeftThumbY, (short)(32767 * int.Parse(percentages[1]) / 100));
                            continue;
                        case "1":
                            continue;
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
                            continue;
                        case "9":
                            report.SetAxis(Xbox360Axes.RightTrigger, short.MaxValue);
                            continue;
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
                            continue;
                        case "3":
                            report.SetButtonState(Xbox360Buttons.X, pressed);
                            continue;
                        case "4":
                            report.SetButtonState(Xbox360Buttons.B, pressed);
                            continue;
                        case "5":
                            report.SetButtonState(Xbox360Buttons.Y, pressed);
                            continue;
                        case "8":
                            report.SetButtonState(Xbox360Buttons.LeftShoulder, pressed);
                            continue;
                        case "9":
                            report.SetButtonState(Xbox360Buttons.RightShoulder, pressed);
                            continue;
                        case "10":
                            report.SetButtonState(Xbox360Buttons.Left, pressed);
                            continue;
                        case "11":
                            report.SetButtonState(Xbox360Buttons.Up, pressed);
                            continue;
                        case "12":
                            report.SetButtonState(Xbox360Buttons.Right, pressed);
                            continue;
                        case "13":
                            report.SetButtonState(Xbox360Buttons.Down, pressed);
                            continue;
                        case "14":
                            report.SetButtonState(Xbox360Buttons.LeftThumb, pressed);
                            continue;
                        case "15":
                            report.SetButtonState(Xbox360Buttons.RightThumb, pressed);
                            continue;
                        case "16":
                            report.SetButtonState(Xbox360Buttons.Start, pressed);
                            continue;
                        case "17":
                            report.SetButtonState(Xbox360Buttons.Guide, pressed);
                            continue;
                    }
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
