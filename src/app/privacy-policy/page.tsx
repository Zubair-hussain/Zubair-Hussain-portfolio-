import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import ThemeProvider from "@/components/ui/ThemeProvider";
import DeferredClientTools from "@/components/ui/DeferredClientTools";
import { getSiteUrl } from "@/lib/site-url";
import { PROFILE } from "@/lib/zubair-profile";

export const dynamic = "force-static";
export const revalidate = false;

const TITLE = "Privacy & Cookie Policy";
const DESCRIPTION =
  "How zubairhussain.xyz collects, uses and protects personal data and cookies, including your rights under GDPR, UK GDPR, CCPA/CPRA and other privacy laws.";
const LAST_UPDATED = "October 31, 2026";

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/privacy-policy`;

  return {
    metadataBase: new URL(siteUrl),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${TITLE} | Zubair Hussain`,
      description: DESCRIPTION,
      siteName: "Zubair Hussain Portfolio",
    },
    robots: { index: true, follow: true },
  };
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-28">
      <h2 className="font-display text-2xl font-light sm:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base [&_a]:text-[hsl(var(--primary))] [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-[hsl(var(--foreground))]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const email = PROFILE.email;

  return (
    <ThemeProvider>
      <Navigation />
      <main
        id="main-content"
        className="section-padding relative min-h-screen overflow-hidden"
      >
        <div className="container-custom">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to portfolio
          </Link>

          <header className="mt-10 max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
              Legal
            </p>
            <h1 className="mt-4 font-display text-4xl font-light sm:text-6xl">
              {TITLE}
            </h1>
            <p className="mt-5 text-xs font-mono text-[hsl(var(--muted-foreground))]">
              Last updated: {LAST_UPDATED}
            </p>
          </header>

          <article className="max-w-3xl">
            <Section id="who-we-are" title="1. Who we are">
              <p>
                This website, <strong>zubairhussain.xyz</strong>, is the personal
                portfolio of Zubair Hussain, an independent developer based in
                Hyderabad, Pakistan (&quot;I&quot;, &quot;me&quot;, &quot;my&quot;). I am the data controller
                for personal data collected through this site. You can contact me
                at <a href={`mailto:${email}`}>{email}</a>.
              </p>
              <p>
                This policy explains what data is collected, why, how long it is
                kept, and the choices and rights you have, including under the EU
                and UK General Data Protection Regulation (GDPR / UK GDPR), the
                ePrivacy Directive, the California Consumer Privacy Act as amended
                by the CPRA (CCPA), and other US state privacy laws.
              </p>
            </Section>

            <Section id="data-we-collect" title="2. Data I collect">
              <p>
                <strong>Information you provide.</strong> When you use the hire-me /
                contact form, the scheduling flow or the chat assistant, I receive
                what you submit, such as your name, email address, location,
                project details and any message you write. Please do not submit
                sensitive information (health data, government IDs, payment card
                numbers) through these tools.
              </p>
              <p>
                <strong>Information collected automatically.</strong> Your browser
                sends technical data such as IP address, browser and device type,
                language, pages viewed and referring page. With your consent, Google
                Analytics / Google Tag Manager also set cookies or similar
                identifiers to produce aggregated usage statistics.
              </p>
              <p>
                <strong>Information I do not collect.</strong> I do not run user
                accounts, do not sell personal data, and do not knowingly collect
                data from children under 16.
              </p>
            </Section>

            <Section id="purposes" title="3. Why I use your data and legal bases">
              <ul>
                <li>
                  <strong>Responding to enquiries and bookings</strong> (contact
                  form, scheduling, chat): performance of a contract or steps taken
                  at your request, and my legitimate interest in replying to you
                  (GDPR Art. 6(1)(b), (f)).
                </li>
                <li>
                  <strong>Security and abuse prevention</strong> (bot checks via
                  Cloudflare Turnstile, rate limiting): legitimate interest in
                  keeping the site safe (Art. 6(1)(f)).
                </li>
                <li>
                  <strong>Analytics and measurement</strong> (Google Analytics /
                  Tag Manager): your consent (Art. 6(1)(a)). No analytics or
                  advertising storage is granted until you click Accept.
                </li>
                <li>
                  <strong>Remembering preferences</strong> (theme, language, cookie
                  choice): strictly necessary or functional storage, which does not
                  require consent.
                </li>
                <li>
                  <strong>Legal obligations</strong>: where required to comply with
                  applicable law.
                </li>
              </ul>
            </Section>

            <Section id="cookies" title="4. Cookies and similar technologies">
              <p>
                When you first visit, a banner asks you to accept or decline
                cookies. Declining is as easy as accepting, and the site works the
                same either way. Google Consent Mode v2 is used so that analytics
                and advertising storage stay <strong>denied</strong> by default
                and only switch to granted if you accept.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Purpose</th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-4 font-mono">cookie-consent</td>
                      <td className="py-2 pr-4">Stores your cookie choice</td>
                      <td className="py-2 pr-4">Necessary</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-4 font-mono">locale</td>
                      <td className="py-2 pr-4">Remembers your language</td>
                      <td className="py-2 pr-4">Functional</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-4 font-mono">theme (local storage)</td>
                      <td className="py-2 pr-4">Remembers light / dark mode</td>
                      <td className="py-2 pr-4">Functional</td>
                      <td className="py-2">Until cleared</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono">_ga, _ga_*, _gid</td>
                      <td className="py-2 pr-4">
                        Google Analytics: counts visits and pages (set only after
                        Accept)
                      </td>
                      <td className="py-2 pr-4">Analytics</td>
                      <td className="py-2">Up to 2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                <strong>Change or withdraw your choice at any time</strong> using
                the &quot;Cookie settings&quot; link in the site footer, or by clearing this
                site&apos;s cookies and storage in your browser. Withdrawing consent
                does not affect processing done before withdrawal.
              </p>
            </Section>

            <Section id="sharing" title="5. Who I share data with">
              <p>
                I do not sell your personal data and I do not &quot;share&quot; it for
                cross-context behavioral advertising. I use the following service
                providers (processors) who handle data only to provide their
                service:
              </p>
              <ul>
                <li>
                  Cloudflare, for hosting, security, Turnstile bot protection and
                  the AI chat model.
                </li>
                <li>
                  Google (Analytics, Tag Manager, Fonts, and Firebase), for
                  analytics (with consent) and application services.
                </li>
                <li>Google Calendar and Google Meet, if you choose to book a call Your name, email, notes and chosen time create an event on my Google Calendar, a Meet link, and an invitation sent to you. The request passes through my booking service on Google Cloud, which does not store it. The booking page uses Cloudflare&apos;s location data, based on your IP address, to show times in your local time zone.</li>
                <li>
                  YouTube (privacy-enhanced mode), when you play an embedded video.
                </li>
                <li>
                  An email delivery service, to forward your contact form message
                  to me.
                </li>
              </ul>
              <p>
                I may also disclose data where required by law or to protect rights
                and security.
              </p>
            </Section>

            <Section id="transfers" title="6. International transfers">
              <p>
                I am based in Pakistan and the providers above operate globally, so
                your data may be processed outside your country, including in the
                United States. Where the GDPR or UK GDPR applies, transfers rely on
                safeguards such as the EU-US Data Privacy Framework (where the
                provider is certified) or Standard Contractual Clauses.
              </p>
            </Section>

            <Section id="retention" title="7. How long I keep data">
              <ul>
                <li>
                  Contact, scheduling and chat messages: kept only as long as needed
                  to respond and for any resulting work, normally no more than 24
                  months after the last contact, unless a longer period is legally
                  required.
                </li>
                <li>
                  Analytics data: retained according to Google Analytics settings
                  (generally 14 months or less).
                </li>
                <li>Cookies: see the table in section 4.</li>
              </ul>
            </Section>

            <Section id="eu-uk-rights" title="8. Your rights (EEA, UK and Switzerland)">
              <p>You have the right to:</p>
              <ul>
                <li>access the personal data I hold about you;</li>
                <li>have inaccurate data corrected;</li>
                <li>have your data erased (&quot;right to be forgotten&quot;);</li>
                <li>restrict or object to processing, including processing based on legitimate interests;</li>
                <li>data portability;</li>
                <li>withdraw consent at any time, where processing is based on consent;</li>
                <li>
                  lodge a complaint with your local data protection authority (for
                  EU residents, a list is at edpb.europa.eu; for the UK, the
                  Information Commissioner&apos;s Office at ico.org.uk).
                </li>
              </ul>
              <p>
                To exercise these rights, email{" "}
                <a href={`mailto:${email}`}>{email}</a>. I will respond within one
                month.
              </p>
            </Section>

            <Section id="us-rights" title="9. Your rights (California and other US states)">
              <p>
                Residents of California, Colorado, Connecticut, Virginia, Utah,
                Texas, Oregon and other states with privacy laws may have the right
                to know and access what personal information is collected, request
                deletion or correction, opt out of the sale or sharing of personal
                information and of targeted advertising, and not be discriminated
                against for exercising these rights.
              </p>
              <ul>
                <li>
                  <strong>Categories collected</strong> in the past 12 months:
                  identifiers (name, email, IP address), internet activity (pages
                  viewed), and the content of messages you send.
                </li>
                <li>
                  <strong>Sale / sharing:</strong> I do not sell or share personal
                  information for cross-context behavioral advertising. Choosing
                  Decline in the cookie banner keeps all advertising storage
                  denied.
                </li>
                <li>
                  <strong>Sensitive personal information:</strong> not knowingly
                  collected.
                </li>
                <li>
                  <strong>Opt-in by default:</strong> analytics and advertising
                  storage stay off until you click Accept, so no opt-out signal
                  (including Global Privacy Control) is needed to prevent them.
                </li>
              </ul>
              <p>
                To make a request, email <a href={`mailto:${email}`}>{email}</a>. I
                may need to verify your identity first, and you may use an
                authorized agent. You may appeal a refusal by replying to my
                response.
              </p>
            </Section>

            <Section id="security" title="10. Security">
              <p>
                The site is served over HTTPS and protected with security headers,
                bot protection and rate limiting. No method of transmission or
                storage is perfectly secure, so I cannot guarantee absolute
                security. If a breach affecting you occurs, I will notify you and
                the relevant authorities as required by law.
              </p>
            </Section>

            <Section id="children" title="11. Children">
              <p>
                This site is not directed at children under 16 and I do not
                knowingly collect their personal data. If you believe a child has
                provided data, contact me and I will delete it.
              </p>
            </Section>

            <Section id="external-links" title="12. External links">
              <p>
                This site links to third-party sites such as GitHub, LinkedIn and
                X. Their privacy practices are their own and are not covered by
                this policy.
              </p>
            </Section>

            <Section id="changes" title="13. Changes to this policy">
              <p>
                I may update this policy from time to time. The date at the top
                shows the latest revision. Material changes will be highlighted on
                this page.
              </p>
            </Section>

            <Section id="contact" title="14. Contact">
              <p>
                Questions or requests about privacy:{" "}
                <a href={`mailto:${email}`}>{email}</a>.
              </p>
            </Section>
          </article>
        </div>
      </main>
      <Footer />
      <DeferredClientTools />
    </ThemeProvider>
  );
}
