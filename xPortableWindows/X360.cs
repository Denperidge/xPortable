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

            string button = e.Data.Split('/')[0];
            string value = e.Data.Split('/')[1];


            // Joysticks
            if (button == "0" || button == "1" || button == "2" || button == "3")
            {

                //report.SetAxis(Xbox360Axes.LeftThumbX, 32767);
                // value = ..
                // TODO joysticks
                switch (button)
                {
                }
            }
            // LT/RT
            else if (button == "8" || button == "9")
            {
                // If pressed, max value. Else, 0
                short pressed = (value == "1") ? short.MaxValue : (short)0;
                switch (button) {
                    case "8":
                        report.SetAxis(Xbox360Axes.LeftTrigger, short.MaxValue);
                        controller.SendReport(report);
                        return;
                    case "9":
                        report.SetAxis(Xbox360Axes.RightTrigger, short.MaxValue);
                        controller.SendReport(report);
                        return;
                }
            }
            // Buttons
            else
            {
                // If value is 1, button is pressed
                bool pressed = (value == "1") ? true : false;
                switch (button)
                {
                    case "4":
                        report.SetButtonState(Xbox360Buttons.A, pressed);
                        controller.SendReport(report);
                        return;
                    case "5":
                        report.SetButtonState(Xbox360Buttons.X, pressed);
                        controller.SendReport(report);
                        return;
                    case "6":
                        report.SetButtonState(Xbox360Buttons.B, pressed);
                        controller.SendReport(report);
                        return;
                    case "7":
                        report.SetButtonState(Xbox360Buttons.Y, pressed);
                        controller.SendReport(report);
                        return;
                    case "10":
                        report.SetButtonState(Xbox360Buttons.LeftShoulder, pressed);
                        controller.SendReport(report);
                        return;
                    case "11":
                        report.SetButtonState(Xbox360Buttons.RightShoulder, pressed);
                        controller.SendReport(report);
                        return;
                    case "12":
                        report.SetButtonState(Xbox360Buttons.Left, pressed);
                        controller.SendReport(report);
                        return;
                    case "13":
                        report.SetButtonState(Xbox360Buttons.Up, pressed);
                        controller.SendReport(report);
                        return;
                    case "14":
                        report.SetButtonState(Xbox360Buttons.Right, pressed);
                        controller.SendReport(report);
                        return;
                    case "15":
                        report.SetButtonState(Xbox360Buttons.Down, pressed);
                        controller.SendReport(report);
                        return;
                    case "16":
                        report.SetButtonState(Xbox360Buttons.LeftThumb, pressed);
                        controller.SendReport(report);
                        return;
                    case "17":
                        report.SetButtonState(Xbox360Buttons.RightThumb, pressed);
                        controller.SendReport(report);
                        return;
                    case "18":
                        report.SetButtonState(Xbox360Buttons.Guide, pressed);
                        controller.SendReport(report);
                        return;
                    case "19":
                        report.SetButtonState(Xbox360Buttons.Start, pressed);
                        controller.SendReport(report);
                        return;
                }
            }

            //switch(e.dat)

            //report.SetButtonState(4096, true);
            //int buttonpressed = e.Data.Split("/");
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
