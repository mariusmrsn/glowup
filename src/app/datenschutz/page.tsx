import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Datenschutzerklärung – GlowUp" };

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Link>

        <h1 className="text-3xl font-black mb-2">Datenschutzerklärung</h1>
        <p className="text-muted-foreground text-sm mb-10">Stand: Juni 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section className="space-y-3">
            <h2 className="text-lg font-bold">1. Verantwortlicher</h2>
            <p className="text-muted-foreground leading-relaxed">
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
            </p>
            <div className="bg-secondary rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold">Marius Muresan</p>
              <p className="text-muted-foreground">E-Mail: mariusmuresan229@gmail.com</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">2. Erhobene Daten und Zweck der Verarbeitung</h2>
            <p className="text-muted-foreground leading-relaxed">
              Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der Nutzung von GlowUp. Folgende Daten werden erhoben:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-2">
              <li><strong className="text-foreground">Registrierungsdaten:</strong> Benutzername und E-Mail-Adresse, die du bei der Registrierung angibst.</li>
              <li><strong className="text-foreground">Profildaten:</strong> Optional: Profilbild, Bio-Text, Körpergröße, Gewicht (nur für die BMI-Anzeige).</li>
              <li><strong className="text-foreground">Nutzungsdaten:</strong> Abgeschlossene Gewohnheiten, XP, Level, Streak, Achievements und andere Spielfortschrittsdaten.</li>
              <li><strong className="text-foreground">Technische Daten:</strong> IP-Adresse, Browser-Typ und Zeitstempel beim Zugriff auf die Plattform (Serverprotokolle).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für optionale Profildaten.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">3. Speicherung und Aufbewahrungsdauer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Deine Daten werden auf Servern von <strong className="text-foreground">Supabase Inc.</strong> (USA, mit EU-Datenzentrum) gespeichert. Supabase ist nach dem EU-US Data Privacy Framework zertifiziert. Daten werden gelöscht, sobald sie für die Nutzung des Dienstes nicht mehr erforderlich sind oder du die Löschung deines Kontos beantragst.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">4. Weitergabe an Dritte</h2>
            <p className="text-muted-foreground leading-relaxed">
              Deine Daten werden nicht an Dritte zu Werbezwecken verkauft oder weitergegeben. Wir nutzen folgende Dienstleister:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-2">
              <li><strong className="text-foreground">Supabase Inc.</strong> – Datenbankhosting und Dateispeicherung (Profilbilder).</li>
              <li><strong className="text-foreground">Vercel Inc.</strong> – Hosting der Webanwendung, Serverless Functions.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Mit beiden Anbietern bestehen Auftragsverarbeitungsverträge (AVV) gemäß Art. 28 DSGVO.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">5. Cookies und Sitzungsdaten</h2>
            <p className="text-muted-foreground leading-relaxed">
              GlowUp verwendet ausschließlich technisch notwendige Session-Cookies zur Aufrechterhaltung deiner Anmeldung. Es werden keine Tracking- oder Werbe-Cookies eingesetzt. Eine Einwilligung gemäß § 25 TTDSG ist für diese Cookies nicht erforderlich.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">6. Deine Rechte</h2>
            <p className="text-muted-foreground leading-relaxed">Du hast folgende Rechte gegenüber dem Verantwortlichen:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-2">
              <li><strong className="text-foreground">Auskunft</strong> (Art. 15 DSGVO): Du kannst Auskunft über die zu dir gespeicherten Daten verlangen.</li>
              <li><strong className="text-foreground">Berichtigung</strong> (Art. 16 DSGVO): Du kannst unrichtige Daten berichtigen lassen.</li>
              <li><strong className="text-foreground">Löschung</strong> (Art. 17 DSGVO): Du kannst die Löschung deiner Daten verlangen.</li>
              <li><strong className="text-foreground">Einschränkung</strong> (Art. 18 DSGVO): Du kannst die Verarbeitung einschränken lassen.</li>
              <li><strong className="text-foreground">Datenübertragbarkeit</strong> (Art. 20 DSGVO): Du kannst deine Daten in einem maschinenlesbaren Format erhalten.</li>
              <li><strong className="text-foreground">Widerspruch</strong> (Art. 21 DSGVO): Du kannst der Verarbeitung widersprechen.</li>
              <li><strong className="text-foreground">Beschwerde</strong>: Du hast das Recht, dich bei einer Datenschutzbehörde zu beschweren (z. B. der zuständigen Landesbehörde).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Zur Ausübung deiner Rechte nutze unser{" "}
              <Link href="/kontakt" className="text-indigo-500 underline hover:text-indigo-400 transition-colors">Kontaktformular</Link>
              {" "}oder wende dich direkt an: <strong className="text-foreground">mariusmuresan229@gmail.com</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">7. Minderjährigenschutz</h2>
            <p className="text-muted-foreground leading-relaxed">
              GlowUp richtet sich an Nutzer ab 13 Jahren. Personen unter 16 Jahren benötigen die Einwilligung eines Erziehungsberechtigten. Wir erheben wissentlich keine Daten von Kindern unter 13 Jahren. Sollte uns bekannt werden, dass Daten von Kindern unter 13 Jahren gespeichert wurden, werden diese unverzüglich gelöscht.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">8. Änderungen dieser Datenschutzerklärung</h2>
            <p className="text-muted-foreground leading-relaxed">
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets auf dieser Seite abrufbar. Bei wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Zurück zu GlowUp
          </Link>
        </div>
      </div>
    </div>
  );
}
