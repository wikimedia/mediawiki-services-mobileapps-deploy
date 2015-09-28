cmd_Release/syslog.node := ln -f "Release/obj.target/syslog.node" "Release/syslog.node" 2>/dev/null || (rm -rf "Release/syslog.node" && cp -af "Release/obj.target/syslog.node" "Release/syslog.node")
