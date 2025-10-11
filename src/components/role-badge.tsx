import { Badge } from "@/components/ui/badge";

export function RoleBadge({ role }: { role: string }) {
    switch (role) {
        case "admin":
            return <Badge variant="outline" className="ml-2">Admin</Badge>;
        case "user":
            return null;
        default:
            return <Badge variant="outline" className="ml-2">{role.charAt(0).toUpperCase() + role.slice(1)}?</Badge>;
    }
}
