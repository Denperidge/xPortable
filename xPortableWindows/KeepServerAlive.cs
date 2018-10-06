using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp.Server;

namespace xPortableWindows
{
    class KeepServerAlive : WebSocketBehavior
    {
        // Filler for /server, so the server shuts down on OnClose (in case xPortable shuts down unexpectedly)
    }
}
