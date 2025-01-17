import { Navbar } from "../components/navbar";
import withApollo from "../lib/with-apollo";
import { NextSeo } from "next-seo";

const Imprint = () => {
	return (
		<>
			<NextSeo
				title="Imprint | Underbuff"
				description="Imprint Underbuff"
				openGraph={{
					url: `${process.env.NEXT_PUBLIC_URL}/imprint`,
					title: "Imprint | Underbuff",
					description: "Imprint Underbuff",
				}}
			/>

			<Navbar />

			<div style={{ margin: "1rem" }} className="content">
				<h1 className="title is-1">Imprint</h1>
				Da es sich bei vorliegender Webseite um eine nicht kommerzielle,
				nicht gewerbliche und rein privat, persönlich & familiär
				genutzte Webseite handelt, ist eine Impressum mit Angaben nach
				§5 TMG nichtzutreffend. <br />
				<br />
				Jeweiligen, folgende Angaben sind auf rein freiwilliger Basis:
				<br /> <br />
				<strong>Kontakt</strong>
				<br />
				Name: Thomas Kosiewski
				<br />
				Email: fortify.labs@googlemail.com
				<br />
				<br />
				<h2 className="title is-2">Haftungsausschluss:</h2>
				<h3 className="title is-3">Haftung für Inhalte</h3>
				Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
				Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
				können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
				sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
				Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
				bis 10 TMG sind wir als Diensteanbieter jedoch nicht
				verpflichtet, übermittelte oder gespeicherte fremde
				Informationen zu überwachen oder nach Umständen zu forschen, die
				auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
				Entfernung oder Sperrung der Nutzung von Informationen nach den
				allgemeinen Gesetzen bleiben hiervon unberührt. Eine
				diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
				Kenntnis einer konkreten Rechtsverletzung möglich. Bei
				Bekanntwerden von entsprechenden Rechtsverletzungen werden wir
				diese Inhalte umgehend entfernen.
				<br />
				<br />
				<h3 className="title is-3">Haftung für Links</h3>
				Unser Angebot enthält Links zu externen Webseiten Dritter, auf
				deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
				diese fremden Inhalte auch keine Gewähr übernehmen. Für die
				Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
				oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
				wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
				überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
				Verlinkung nicht erkennbar. Eine permanente inhaltliche
				Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
				Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
				Bekanntwerden von Rechtsverletzungen werden wir derartige Links
				umgehend entfernen.
				<br />
				<br />
				<h3 className="title is-3">Urheberrecht</h3>
				Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
				diesen Seiten unterliegen dem deutschen Urheberrecht. Die
				Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
				Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
				schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
				Downloads und Kopien dieser Seite sind nur für den privaten,
				nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf
				dieser Seite nicht vom Betreiber erstellt wurden, werden die
				Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
				Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
				Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
				entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
				werden wir derartige Inhalte umgehend entfernen.
				<br />
				<br />
				<h3 className="title is-3">Datenschutz</h3>
				Die Nutzung unserer Webseite ist in der Regel ohne Angabe
				personenbezogener Daten möglich. Soweit auf unseren Seiten
				personenbezogene Daten (beispielsweise Name, Anschrift oder
				eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich,
				stets auf freiwilliger Basis. Diese Daten werden ohne Ihre
				ausdrückliche Zustimmung nicht an Dritte weitergegeben.
				<br />
				Wir weisen darauf hin, dass die Datenübertragung im Internet
				(z.B. bei der Kommunikation per E-Mail) Sicherheitslücken
				aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff
				durch Dritte ist nicht möglich.
				<br />
				Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten
				Kontaktdaten durch Dritte zur Übersendung von nicht ausdrücklich
				angeforderter Werbung und Informationsmaterialien wird hiermit
				ausdrücklich widersprochen. Die Betreiber der Seiten behalten
				sich ausdrücklich rechtliche Schritte im Falle der unverlangten
				Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor.
				<br />
				<br />
				<h3 className="title is-3">Google Analytics</h3>
				Diese Website benutzt Google Analytics, einen Webanalysedienst
				der Google Inc. (''Google''). Google Analytics verwendet sog.
				''Cookies'', Textdateien, die auf Ihrem Computer gespeichert
				werden und die eine Analyse der Benutzung der Website durch Sie
				ermöglicht. Die durch den Cookie erzeugten Informationen über
				Ihre Benutzung dieser Website (einschließlich Ihrer IP-Adresse)
				wird an einen Server von Google in den USA übertragen und dort
				gespeichert. Google wird diese Informationen benutzen, um Ihre
				Nutzung der Website auszuwerten, um Reports über die
				Websiteaktivitäten für die Websitebetreiber zusammenzustellen
				und um weitere mit der Websitenutzung und der Internetnutzung
				verbundene Dienstleistungen zu erbringen. Auch wird Google diese
				Informationen gegebenenfalls an Dritte übertragen, sofern dies
				gesetzlich vorgeschrieben oder soweit Dritte diese Daten im
				Auftrag von Google verarbeiten. Google wird in keinem Fall Ihre
				IP-Adresse mit anderen Daten der Google in Verbindung bringen.
				Sie können die Installation der Cookies durch eine entsprechende
				Einstellung Ihrer Browser Software verhindern; wir weisen Sie
				jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht
				sämtliche Funktionen dieser Website voll umfänglich nutzen
				können. Durch die Nutzung dieser Website erklären Sie sich mit
				der Bearbeitung der über Sie erhobenen Daten durch Google in der
				zuvor beschriebenen Art und Weise und zu dem zuvor benannten
				Zweck einverstanden.
				<br />
				<br />
			</div>
		</>
	);
};

export default withApollo(Imprint);
