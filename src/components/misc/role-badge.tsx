import { Badge } from "@/components/ui/badge";

export function RoleBadge({ role }: { role: string }) {
    switch (role) {
        case "admin":
            return <Badge variant="outline" className="ml-1">Admin</Badge>;
        case "user":
            return null;
        default:
            return <Badge variant="outline" className="ml-1">{role.charAt(0).toUpperCase() + role.slice(1)}?</Badge>;
    }
}
