using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nefarius.ViGEm.Client;
using Nefarius.ViGEm.Client.Targets;
using WebSocketSharp.Server;

namespace xPortableWindows
{
    public static class Globals
    {
        public static ViGEmClient client; // ViGEm Client to handle controllers
        public static WebSocketServer wssv;  // Websocket to communicate with mobiles
        public static int? portCalculator;  // See connect.cs for explanation
    }
}
