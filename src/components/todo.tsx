import { Construction } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function TODO() {
    return (
        <Alert variant="default" className="m-4 bg-yellow-200 border-yellow-400 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100">
            <Construction />
            <AlertTitle className="font-bold ml-2">In Arbeit</AlertTitle>
            <AlertDescription className="ml-2">Hier wird noch dran gearbeitet!</AlertDescription>
        </Alert>
    );
}
