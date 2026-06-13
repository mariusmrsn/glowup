import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Nutzungsbedingungen – GlowUp" };

export default function NutzungsbedingungenPage() {
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

        <h1 className="text-3xl font-black mb-2">Nutzungsbedingungen</h1>
        <p className="text-muted-foreground text-sm mb-10">Stand: Juni 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section className="space-y-3">
            <h2 className="text-lg font-bold">1. Geltungsbereich</h2>
            <p className="text-muted-foreground leading-relaxed">
              Diese Nutzungsbedingungen gelten für die Nutzung der Plattform GlowUp (nachfolgend „Dienst"), betrieben von Marius Muresan. Mit der Registrierung und Nutzung des Dienstes erkennst du diese Bedingungen verbindlich an. Solltest du diesen nicht zustimmen, darfst du den Dienst nicht nutzen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">2. Leistungsbeschreibung</h2>
            <p className="text-muted-foreground leading-relaxed">
              GlowUp ist eine gamifizierte Selbstverbesserungs-App. Nutzer können Gewohnheiten tracken, Attribute aufbauen, tägliche Quests erfüllen, Achievements freischalten und sich mit anderen Nutzern messen. Der Dienst wird kostenlos bereitgestellt und kann jederzeit ohne Angabe von Gründen eingestellt oder verändert werden.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">3. Registrierung und Konto</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-2">
              <li>Die Registrierung erfordert einen Benutzernamen und eine gültige E-Mail-Adresse.</li>
              <li>Du bist verpflichtet, wahrheitsgemäße Angaben zu machen und dein Konto vor unbefugtem Zugriff zu schützen.</li>
              <li>Pro Person ist nur ein Konto erlaubt. Mehrfachkonten können ohne Vorwarnung gesperrt werden.</li>
              <li>Die Nutzung des Dienstes ist erst ab 13 Jahren erlaubt. Unter 16 Jahren ist die Einwilligung eines Erziehungsberechtigten erforderlich.</li>
              <li>Du bist für alle Aktivitäten verantwortlich, die über dein Konto erfolgen.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">4. Erlaubte Nutzung</h2>
            <p className="text-muted-foreground leading-relaxed">Du darfst den Dienst ausschließlich für persönliche, nicht-kommerzielle Zwecke nutzen. Erlaubt ist:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-2">
              <li>Erstellen und Abschließen von Gewohnheiten und Zielen</li>
              <li>Interaktion mit anderen Nutzern über das Folgen-System und die Rangliste</li>
              <li>Personalisierung des Profils (Bild, Bio, Körperdaten)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">5. Verbotene Handlungen</h2>
            <p className="text-muted-foreground leading-relaxed">Folgende Handlungen sind ausdrücklich untersagt:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-2">
              <li>Manipulation von Spielmechaniken, XP-Werten oder Bestenlisten durch technische Mittel (Cheating, Bots, Exploit).</li>
              <li>Hochladen von Inhalten, die rechtswidrig, beleidigend, rassistisch, sexuell explizit oder anderweitig anstößig sind.</li>
              <li>Belästigung, Bedrohung oder Mobbing anderer Nutzer.</li>
              <li>Reverse Engineering, Dekompilierung oder unbefugter Zugriff auf Systemkomponenten.</li>
              <li>Kommerzieller Weiterverkauf oder Lizenzierung des Dienstes oder seiner Inhalte.</li>
              <li>Erstellung gefälschter Konten zum Zweck der Manipulation der Rangliste.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Verstöße können zur sofortigen Sperrung des Kontos führen, ohne dass ein Anspruch auf Wiederherstellung besteht.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">6. Nutzerinhalte</h2>
            <p className="text-muted-foreground leading-relaxed">
              Du beibehältst das Eigentum an allen Inhalten, die du auf GlowUp hochlädst (z. B. Profilbilder). Mit dem Hochladen räumst du GlowUp ein nicht-exklusives, kostenloses Recht ein, diese Inhalte zum Betrieb des Dienstes zu verwenden, zu speichern und anzuzeigen. Dieses Recht erlischt mit der Löschung des Kontos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Du versicherst, dass hochgeladene Inhalte keine Rechte Dritter verletzen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">7. Virtuelle Güter</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coins, XP, Levels, Achievements und Shop-Items sind virtuelle Güter ohne realen Geldwert. Sie können nicht gegen Geld eingetauscht, übertragen oder vererbt werden. GlowUp behält sich vor, virtuelle Güter jederzeit anzupassen oder zu entfernen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">8. Verfügbarkeit und Haftungsausschluss</h2>
            <p className="text-muted-foreground leading-relaxed">
              Der Dienst wird „wie vorliegend" ohne Gewährleistung bereitgestellt. Wir übernehmen keine Garantie für eine ununterbrochene, fehlerfreie Verfügbarkeit. GlowUp haftet nicht für Datenverluste, entgangene Fortschritte oder Schäden, die durch Ausfälle, Fehler oder Sicherheitsvorfälle entstehen – es sei denn, diese beruhen auf grober Fahrlässigkeit oder Vorsatz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">9. Kündigung</h2>
            <p className="text-muted-foreground leading-relaxed">
              Du kannst dein Konto jederzeit über unser <a href="/kontakt" className="text-indigo-500 underline hover:text-indigo-400 transition-colors">Kontaktformular</a> kündigen oder die Löschung beantragen. Wir behalten uns vor, Konten bei Verstößen gegen diese Nutzungsbedingungen ohne Vorwarnung zu sperren oder zu löschen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">10. Änderungen der Nutzungsbedingungen</h2>
            <p className="text-muted-foreground leading-relaxed">
              Wir behalten uns vor, diese Nutzungsbedingungen jederzeit anzupassen. Bei wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert. Die fortgesetzte Nutzung des Dienstes nach der Benachrichtigung gilt als Zustimmung zu den geänderten Bedingungen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">11. Anwendbares Recht</h2>
            <p className="text-muted-foreground leading-relaxed">
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für Streitigkeiten mit Kaufleuten ist der Sitz des Betreibers. Verbraucher können auch am Gericht ihres allgemeinen Wohnsitzes klagen.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <span className="text-foreground">https://ec.europa.eu/consumers/odr</span>. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
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
