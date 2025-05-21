import { Home, MessageSquare, Users, Settings } from "lucide-react";
import { Link } from "react-router";

export default function Sidebar() {
  return (
    <aside className="w-16 h-screen bg-background border-r border-border">
      <nav className="flex flex-col items-center gap-4 mt-4">
        <Link
          to="/"
          className="p-2 hover:bg-accent rounded-xl transition-colors"
        >
          <Home className="w-6 h-6 text-muted-foreground" />
        </Link>
        <Link
          to="/channels"
          className="p-2 hover:bg-accent rounded-xl transition-colors"
        >
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </Link>
        <Link
          to="/friends"
          className="p-2 hover:bg-accent rounded-xl transition-colors"
        >
          <Users className="w-6 h-6 text-muted-foreground" />
        </Link>
        <Link
          to="/settings"
          className="p-2 hover:bg-accent rounded-xl transition-colors"
        >
          <Settings className="w-6 h-6 text-muted-foreground" />
        </Link>
      </nav>
    </aside>
  );
}
