export function TimeOfDayWelcome({ name }: { name?: string | null }) {
    const hour = new Date().getHours();
    let greeting: string;

    if (hour < 6) {
        greeting = "Jetzt aber ab ins Bett";
    } else if (hour < 12) {
        greeting = "Guten Morgen";
    } else if (hour < 18) {
        greeting = "Hallo";
    } else {
        greeting = "Zeit für eine Gute-Nacht-Geschichte";
    }

    return (
        <span>
            {greeting}{name ? `, ${name}` : ""}!
        </span>
    );
}