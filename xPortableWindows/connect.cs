using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using WebSocketSharp;
using WebSocketSharp.Server;
using Nefarius.ViGEm.Client;
using Nefarius.ViGEm.Client.Targets;
using Nefarius.ViGEm.Client.Targets.Xbox360;
using System.Windows.Controls;

namespace xPortableWindows
{
    class connect : WebSocketBehavior
    {

        private void connectClientToPort(object sender, Xbox360FeedbackReceivedEventArgs eventArgs)
        {
            Xbox360Controller newController = (Xbox360Controller)sender;
            newController.FeedbackReceived -= connectClientToPort;

            Console.WriteLine(eventArgs);
            Console.WriteLine(eventArgs.LedNumber);

            // ledNumber returns 0 for player 1, 1 for player 2, 2 for player 3, 3 for player 4
            int port = eventArgs.LedNumber + 1;
            if (port > 4)
            {
                newController.Disconnect();
                Send("Disconnect:4 controllers already connected!");
                return;
            }



            Application.Current.Dispatcher.Invoke(() =>
            {
                MainWindow mainWindow = (MainWindow)Application.Current.MainWindow;
                Label statusLabel;
                Button disconnectButton;

                switch (port)
                {
                    case 1:
                        statusLabel = mainWindow.lblController1Connected;
                        disconnectButton = mainWindow.btnController1Disconnect;
                        break;
                    case 2:
                        statusLabel = mainWindow.lblController2Connected;
                        disconnectButton = mainWindow.btnController2Disconnect;
                        break;
                    case 3:
                        statusLabel = mainWindow.lblController3Connected;
                        disconnectButton = mainWindow.btnController3Disconnect;
                        break;
                    case 4:
                        statusLabel = mainWindow.lblController4Connected;
                        disconnectButton = mainWindow.btnController4Disconnect;
                        break;

                    default:
                        return;
                }

                Globals.wssv.AddWebSocketService("/x360_port" + port, () => new X360(newController, port, statusLabel, disconnectButton));
                // Example: Connected:x360_port1
                Send("Connected:x360_port" + port);
            });
        }

        protected override void OnOpen()
        {
            Xbox360Controller newController = new Xbox360Controller(Globals.client);

            newController.FeedbackReceived += connectClientToPort;

            newController.Connect();
        }
    }
}
