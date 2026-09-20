import Link from 'next/link';

export function PrivacidadeContentEn() {
  return (
    <>
      <p>
        This Policy explains what data Sistema Seabra collects, why it collects it, who
        it shares it with, how long it retains it, and what you can require of us. It
        follows the General Data Protection Law (Law No. 13.709/2018 — LGPD).
      </p>
      <p>
        <strong>Who is responsible for your data (controller):</strong> SEABRA
        SOLUTIONS LTDA, registered under CNPJ No. 50.132.061/0001-80, headquartered in
        Florianópolis, Santa Catarina, Brazil — referred to herein as &quot;we&quot; and
        &quot;our&quot;.
      </p>
      <p>
        <strong>Service:</strong> <strong>Sistema Seabra</strong>, in its Android, iOS,
        and web versions, and the sistemaseabra.com.br website.
      </p>
      <p>
        <strong>Privacy contact:</strong>{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        1. The essentials, on one screen
      </h2>
      <p>
        The rest of this document details every point, but if you read only this
        section you already know the main ones:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>We do not sell your data</strong>, and we do not provide it to
          third parties for advertising.
        </li>
        <li>
          <strong>There is no ad tracker inside the app.</strong> We do not use
          Google Analytics, the Facebook SDK, or anything similar.
        </li>
        <li>
          <strong>The herd you register is yours.</strong> You can export it as a
          spreadsheet or a PDF whenever you want, and request its deletion.
        </li>
        <li>
          <strong>Voice dictation never leaves your device.</strong> Recognition is
          performed by your phone itself; no audio is sent to any server.
        </li>
        <li>
          <strong>
            Camera, microphone, and location are only accessed with your permission
          </strong>
          , and never in the background.
        </li>
        <li>
          <strong>
            The artificial intelligence assistant sends data from your herd to an
            external provider
          </strong>{' '}
          in order to answer you. If that does not work for you, simply do not use
          the assistant — section 6 explains this in detail.
        </li>
        <li>
          <strong>
            We use aggregated and anonymized data to improve the app and produce
            benchmarks for the industry
          </strong>{' '}
          — the name of your property and your animals never appears, and you can
          ask to opt out. See section 8.
        </li>
        <li>
          <strong>
            Accepting an association&apos;s invitation means sharing your herd with
            it.
          </strong>{' '}
          Nothing is shared until you accept, and section 7.3 states exactly what
          the association will be able to see.
        </li>
        <li>
          <strong>
            You can request a copy, correction, or deletion of your data
          </strong>{' '}
          by email, and we respond within 15 days.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        2. Definitions
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Service or Application:</strong> Sistema Seabra and the
          sistemaseabra.com.br website.
        </li>
        <li>
          <strong>Personal Data:</strong> any information that identifies or makes
          identifiable a natural person.
        </li>
        <li>
          <strong>Processing:</strong> any operation performed with Personal Data —
          collecting, storing, using, sharing, correcting, deleting.
        </li>
        <li>
          <strong>Controller:</strong> whoever decides how and why the data is
          processed.
        </li>
        <li>
          <strong>Processor:</strong> whoever processes data on behalf of the
          controller, following its instructions — for example, the company that
          hosts our database.
        </li>
        <li>
          <strong>Data Subject:</strong> the person to whom the Personal Data
          relates — you.
        </li>
        <li>
          <strong>User:</strong> whoever uses the Service. This can be a producer, a
          producer&apos;s collaborator, a technician, or an association
          administrator.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        3. Who uses Sistema Seabra, and who each piece of data belongs to
      </h2>
      <p>
        Sistema Seabra is used by different types of profiles, and this changes who
        is responsible for which data:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Producer:</strong> registers the property and the herd. With
          respect to the herd&apos;s own data, the producer is the controller and we
          act as the processor — we store and process this data in service to the
          producer.
        </li>
        <li>
          <strong>Collaborator:</strong> a person the producer invites to work on
          their property. Has their own account and access limited to what the
          producer authorizes. The producer sees which entries each collaborator has
          made.
        </li>
        <li>
          <strong>Technician:</strong> a professional who provides services to
          properties. Sees the data of the properties they serve, in order to
          perform the contracted services.
        </li>
        <li>
          <strong>Association administrator:</strong> manages the technicians and
          producers linked to their association, and sees the data necessary to do
          so.
        </li>
      </ul>
      <p>
        With respect to each user&apos;s registration data — name, email, phone
        number, CPF (Brazilian individual taxpayer ID) or CNPJ, billing data — we are
        the controller.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        4. Data We Collect
      </h2>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.1. Data You Provide to Us
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Full name</li>
        <li>Email address</li>
        <li>
          Phone number, also used for WhatsApp and for the access code
        </li>
        <li>
          Password (stored only as a cryptographic hash; we do not have access to
          it)
        </li>
        <li>
          CPF or CNPJ, when necessary for the subscription, for issuing a tax
          document, or for official pedigree registration documents
        </li>
        <li>Address: postal code (CEP), municipality, and state</li>
        <li>Profile photo, if you upload one</li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.2. Property and Herd Data
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Name, location, and geographic coordinates of the property</li>
        <li>
          Animal records: number, ear tag, electronic identification, name, breed,
          coat color, category, species, sex, dates, genealogy, and pedigree
          registration
        </li>
        <li>
          Management, reproduction, weighing, measurement, milk production, health,
          nutrition, cost, and movement entries
        </li>
        <li>
          Photos of animals, ear tags, exams, and documents that you attach
        </li>
        <li>Technical visits, services performed, and their results</li>
      </ul>
      <p>
        Most of this data concerns animals, not people — but it remains linked to
        your account and your property, and for that reason we handle it with the
        same care we give to personal data.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.3. Data Collected Automatically
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>IP address</li>
        <li>
          Device identifier and notification-delivery token (Firebase Cloud
          Messaging token)
        </li>
        <li>Operating system, system version, and device model</li>
        <li>Installed application version</li>
        <li>Browser type and version, on the web version</li>
        <li>
          Error and synchronization logs, to find out why something failed on your
          device
        </li>
        <li>
          Date and time of access and of entries, with authorship — this is what
          lets the producer know who entered what
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.4. Device Permissions
      </h3>
      <p>
        None of these permissions is mandatory to use the Service, and every one of
        them can be revoked at any time in your device settings. What we are unable
        to do without each one:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Camera:</strong> photographing animals, ear tags, exams, and
          documents, and using photo-based record reading.
        </li>
        <li>
          <strong>Photo gallery:</strong> attaching images already on your device and
          saving to it the reports and photos the app generates.
        </li>
        <li>
          <strong>Precise location:</strong> recording the coordinates of the
          property and of the technical visit.{' '}
          <strong>It is only read while the app is open and in use</strong> — we do
          not track your location in the background, and we do not build a history
          of your movements.
        </li>
        <li>
          <strong>Microphone and speech recognition:</strong> filling in fields by
          dictation instead of typing. Recognition runs{' '}
          <strong>on the device itself</strong>; the audio is not recorded or sent
          to any server, ours or a third party&apos;s.
        </li>
        <li>
          <strong>Notifications:</strong> alerting you about expected births,
          drying-off, vaccination, visits, and billing.
        </li>
        <li>
          <strong>Install apps (Android only):</strong> applying the Sistema Seabra
          update from within the app itself, without going through the browser.
          Used only to install Sistema Seabra.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.5. What We Do Not Collect
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          We do not have an advertising SDK or a third-party tracker inside the app.
        </li>
        <li>
          We do not use Google Analytics, Firebase Analytics, Meta Pixel, or the
          equivalent inside the application.
        </li>
        <li>
          We do not store credit card numbers — payment processing is handled by
          Asaas (section 7).
        </li>
        <li>
          We do not collect sensitive personal data within the meaning of Article 5,
          II of the LGPD: racial origin, religious belief, political opinion, union
          membership, health data, sex life, or genetic or biometric data of
          individuals.
        </li>
        <li>We do not record audio or video in the background.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        5. Why We Process Your Data (Legal Bases — Article 7 of the LGPD)
      </h2>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.1. Performance of the Contract (Article 7, V)
      </h3>
      <p>
        Creating and maintaining your account, authenticating access, storing and
        synchronizing the herd, generating reports, issuing documents, processing
        the subscription and billing for it, providing support, and notifying you of
        herd events that the Service has undertaken to notify you about.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.2. Compliance with a Legal or Regulatory Obligation (Article 7, II)
      </h3>
      <p>
        Issuing tax documents, retaining accounting and access records for the
        periods required by law, and complying with orders from a competent
        authority.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.3. Legitimate Interest (Article 7, IX)
      </h3>
      <p>
        Understanding how the Service is used in order to fix defects and improve
        the product, prevent fraud and abuse, ensure account security, and
        administer the Service. Always limited to what is necessary, and always
        weighed against your rights.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.4. Consent (Article 7, I)
      </h3>
      <p>
        Access to the camera, gallery, location, and microphone; sending marketing
        communications; and use of the artificial intelligence assistant. You can
        withdraw your consent at any time, without affecting what was already done
        while it was in effect.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.5. Credit Protection (Article 7, X)
      </h3>
      <p>
        Verifying the status of your subscription and conducting the collection of
        amounts owed.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        6. Artificial Intelligence Assistant
      </h2>
      <p>
        Sistema Seabra has an assistant that answers questions about your herd. It
        deserves its own section because it is the point at which your data leaves
        our infrastructure.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>What is sent:</strong> your question and the herd data necessary
          to answer it — for example, the list of animals, lactations, weighings, or
          management entries related to what you asked.
        </li>
        <li>
          <strong>Where it goes:</strong> to the language-model service{' '}
          <strong>Gemini, by Google LLC</strong>, on servers located outside Brazil.
        </li>
        <li>
          <strong>What is stored:</strong> the conversation history is kept in our
          database, linked to your account, so that you can resume it.
        </li>
        <li>
          <strong>What is not sent:</strong> we do not send your password, your CPF,
          or your payment data to the assistant.
        </li>
        <li>
          <strong>How to avoid using it:</strong> the assistant only receives
          something when you write to it. If you never open the assistant, none of
          your data is sent through this channel.
        </li>
      </ul>
      <p>
        A response from an artificial intelligence assistant may contain errors. It
        does not replace the judgment of a veterinarian or an animal scientist, and
        decisions on management, health, and reproduction remain yours.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        7. Who We Share Data With
      </h2>
      <p>
        <strong>
          We do not sell personal data, and we do not provide it for third-party
          advertising.
        </strong>{' '}
        We share only what is necessary, and only with:
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.1. Processors That Provide Services to Us
      </h3>
      <p>
        To operate, Sistema Seabra depends on companies that process data on our
        behalf, following our instructions and under a contractual obligation to
        protect what they receive. Today, these are:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Hosting, database, and authentication</strong> — Supabase Inc.
          This is where your data is stored.
        </li>
        <li>
          <strong>Mobile notifications</strong> — Google LLC (Firebase Cloud
          Messaging), which receives an identifier for your device.
        </li>
        <li>
          <strong>Artificial intelligence assistant</strong> — Google LLC (Gemini),
          as described in section 6.
        </li>
        <li>
          <strong>Subscription and payment</strong> — Asaas, which receives your
          name, CPF or CNPJ, email, phone number, and payment data. The card number
          is handled by Asaas, not by us.
        </li>
        <li>
          <strong>WhatsApp messages</strong> — a server operated by Seabra Solutions
          itself. The message travels over the WhatsApp network, operated by Meta
          Platforms, like any other.
        </li>
      </ul>
      <p>
        Providers change over time. The always-current list is kept at{' '}
        <Link href="/operadores" className="text-primary hover:underline">
          sistemaseabra.com.br/operadores
        </Link>{' '}
        — if the version of the app you have differs from it, the website prevails.
      </p>
      <p>
        Aside from these processors, we share data with{' '}
        <strong>pedigree registration associations</strong>, when you issue or look
        up an official document, and with{' '}
        <strong>public authorities</strong>, pursuant to a legal requirement or a
        court order.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.2. Other Users of the Service
      </h3>
      <p>
        Sistema Seabra is built to be used by more than one person around the same
        herd. Therefore:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          The <strong>collaborator</strong> you invite sees the data of your
          property that you authorize, and you see what they have entered.
        </li>
        <li>
          The <strong>technician</strong> who serves your property sees the data
          necessary for the service, and the result of the service is recorded in
          the animal record.
        </li>
        <li>
          The <strong>administrator of the association</strong> you have agreed to
          join sees the data of your property — this has its own section right
          below, because it depends on your acceptance and is the broadest data
          sharing in the app.
        </li>
        <li>
          When you share a report, a record, or a spreadsheet generated by the app,{' '}
          <strong>you decide who it goes to</strong> — and from that point on, the
          content is with whomever you sent it to.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.3. When You Accept an Invitation from an Association
      </h3>
      <p>
        An association can invite you to join it. The invitation arrives as a
        request within the app, and{' '}
        <strong>nothing is shared until you accept</strong>. Declining has no
        consequences at all for your account or your herd.
      </p>
      <p>
        <strong>Accepting the invitation is an act of data sharing.</strong>{' '}
        From the moment you accept, the administrator of the association will be
        able to see:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>your registration data — name, email, and phone number;</li>
        <li>the headcount of your herd and the records of your animals;</li>
        <li>
          your management, weighing, reproduction, and dairy testing entries, with
          date and authorship;
        </li>
        <li>
          the reports and spreadsheets generated from this data, which the
          association <strong>can export</strong> outside of the app.
        </li>
      </ul>
      <p>
        The association uses this data for its own purposes: technical monitoring
        of its members&apos; herds, official dairy testing, pedigree registration,
        herd statistics, and any services it offers you. In this processing,{' '}
        <strong>
          the association is the controller of the data it receives and is
          accountable for it
        </strong>
        , and we remain the processor. What the association does with this data is
        governed by its bylaws and its own privacy policy — it is worth reviewing
        them before accepting.
      </p>
      <p>
        <strong>When your association contributes to your subscription.</strong>{' '}
        It can contribute to the cost in two ways:{' '}
        <strong>paying the subscription for you</strong> or{' '}
        <strong>granting a discount</strong> to its members. To apply either one, it
        informs us who its members are.
      </p>
      <p>
        When it pays for you, it sees that your account is active and what it is
        covering. When it is a discount, it sees that you use Sistema Seabra — this
        is what allows the discount entitlement to be recognized. In neither case
        does it see your payment data: that is handled by the payment provider
        indicated in section 7.1.
      </p>
      <p>
        And in both cases, two things do not change: the data of your herd remains
        yours, and{' '}
        <strong>if you leave the association the account remains yours</strong> —
        you start paying the regular price or return to the free plan, without
        losing anything you have registered.
      </p>
      <p>
        <strong>To disaffiliate</strong>, speak with the association or write to{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
        . Disaffiliation ends the association&apos;s access to your data from that
        point forward, but it does not undo what the association has already
        exported or recorded while the relationship existed.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.4. Access by Our Team
      </h3>
      <p>
        Our team is able to access your account&apos;s data through an internal
        administrative panel. This is a processing operation, and for that reason it
        is disclosed here, not hidden:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>What for:</strong> providing support when you report a problem,
          reviewing and correcting data, administering the subscription and
          billing, and producing, at your request, reports about your own herd.
        </li>
        <li>
          <strong>Legal basis:</strong> performance of the contract (Article 7, V)
          and legitimate interest in administering the Service (Article 7, IX),
          always limited to these purposes.
        </li>
        <li>
          <strong>Who has access:</strong> only authorized Seabra Solutions
          personnel, each with an individual, named account.
        </li>
        <li>
          <strong>What is logged:</strong> administrative actions on accounts and
          records — deletions in particular — are logged with author, date, and
          time.
        </li>
        <li>
          <strong>What we do not do with this access:</strong> we do not use this
          data for any other purpose, we do not sell it, we do not transfer it, and
          we do not use it for advertising.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        8. Use of Your Data to Improve the System and the Industry
      </h2>
      <p>
        We want to use what Sistema Seabra accumulates to improve the application
        itself and to produce knowledge useful to the Brazilian goat- and
        sheep-farming industries — production parameters, growth curves, efficiency
        benchmarks. This section states exactly how far we go and where we stop,
        because this is precisely the point where a producer has good reason to be
        cautious.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.1. Improving the Application
      </h3>
      <p>
        We analyze how Sistema Seabra is used to find out what fails, what no one
        can find, and what gets stuck, and to develop new features. The legal basis
        is legitimate interest (Article 7, IX, of the LGPD), and for this purpose
        the data does not leave our infrastructure.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.2. Study and Statistics: Only with Aggregated and Anonymized Data
      </h3>
      <p>
        For study, statistics, and product development we work with{' '}
        <strong>aggregated and anonymized data</strong> — figures that describe the
        group as a whole, never your individual property. For example: the average
        production per lactation for a breed, the weight curve for a category, or
        the distribution of the interval between births.
      </p>
      <p>Regarding this data we make five commitments:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>
            The name, brand, location, and identification of your property and your
            animals never appear
          </strong>{' '}
          in any study, publication, industry report, or comparison.
        </li>
        <li>
          <strong>
            No figure is disclosed if it would allow a property to be identified.
          </strong>{' '}
          A result is only released once it combines enough properties that none of
          them is identifiable, and once no single property accounts for the
          majority of the result. When this threshold is not met, that particular
          breakdown is simply not published.
        </li>
        <li>
          <strong>We do not attempt to re-identify</strong> whoever is behind an
          anonymized piece of data, and we contractually require the same of
          anyone who receives this data from us.
        </li>
        <li>
          <strong>We do not sell your data</strong>, whether aggregated or not.
        </li>
        <li>
          <strong>You can opt out.</strong> Section 8.5 explains how.
        </li>
      </ul>
      <p>
        Once anonymized in this way, the data ceases to be personal data within the
        meaning of art. 12 of the LGPD — and for that reason we can keep and use it
        even after you close your account. What we will not do is call data
        &quot;anonymized&quot; when it still allows someone to be identified.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.3. Benchmarks for You and Reports for the Industry
      </h3>
      <p>
        We may show you how your herd compares to the group as a whole, and we may
        publish industry reports for associations, universities, research
        institutions, and the technical press. In both cases, the rule in section
        8.2 applies: only the group appears, never the individual property. You see
        your own position; no one sees your property inside the figures of others.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.4. Research and Studies with Partners
      </h3>
      <p>
        We may take part in studies conducted by universities, institutes, research
        bodies, and breeders&apos; associations — for example, a study on the
        performance of a breed. When this happens:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>We provide only what the study needs.</strong> In a breed study,
          this means animal data: genealogy, production, weight, births, and
          matings. Your name, CPF, phone number, and the name of your property are
          not included, because they serve no purpose for the research.
        </li>
        <li>
          <strong>
            If the study can be carried out with aggregated and anonymized data,
            that is how it is done.
          </strong>
        </li>
        <li>
          <strong>
            If it needs your herd&apos;s data in identifiable form, we ask for your
            authorization first
          </strong>{' '}
          — for that specific study, in the app (Profile → Research Authorizations),
          stating who is conducting it, for what purpose, and what data is
          disclosed. You can decline, and you can revoke an authorization you
          already gave at any time.
        </li>
        <li>
          <strong>Declining changes nothing.</strong> Not in the app, not in your
          subscription, not in your association.
        </li>
        <li>
          <strong>A study may be sponsored by a company</strong> — in nutrition,
          health, or genetics. When it is, we disclose who the sponsor is at the
          time we request your authorization. Sponsorship does not give the company
          access to your registration data or your herd beyond what the study
          covers.
        </li>
        <li>
          <strong>We are not paid to hand over your data.</strong> When there is
          payment, it is for the work of conducting the study.
        </li>
      </ul>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.5. How to Opt Out
      </h3>
      <p>
        Turn it off in the app, under Profile → Research Authorizations →
        &quot;Industry studies and statistics&quot;, or write to{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>{' '}
        asking that your data not be included in aggregated study datasets. We
        comply and confirm in writing whenever the request is made by email.{' '}
        <strong>You do not lose any functionality</strong> of the application as a
        result.
      </p>
      <p>
        This same request also serves as an objection to processing carried out on
        the basis of legitimate interest, as provided for in art. 18, § 2, of the
        LGPD.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        9. Where Your Data Is Processed
      </h2>
      <p>
        Our processors — Supabase and Google — process data on servers located
        outside Brazil, including in the United States. The LGPD permits this
        international transfer, and it takes place under the contractual clauses
        and protection guarantees offered by these providers, at a level equivalent
        to what Brazilian law requires.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        10. Data Stored on Your Device
      </h2>
      <p>
        Sistema Seabra works without an internet connection, and to do so it keeps a
        copy of your data on the device itself:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          A copy of the herd, of the entries, and of the settings, so you can work
          in the pen without a signal.
        </li>
        <li>
          A queue of entries made without an internet connection, which is uploaded
          as soon as the connection returns.
        </li>
        <li>
          Your access credentials, kept in the secure storage of the device
          operating system (Keychain on iOS, Keystore on Android), not in an
          ordinary file.
        </li>
      </ul>
      <p>
        This data stays on your device and is deleted when you uninstall the
        application. If the device is shared, sign out of your account when you are
        done.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        11. How Long We Retain Your Data
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>While your account exists:</strong> we keep the data necessary to
          provide the Service.
        </li>
        <li>
          <strong>After the account is closed:</strong> we delete or anonymize the
          Personal Data within 90 days, except for what the law requires us to
          retain.
        </li>
        <li>
          <strong>Tax and financial data:</strong> 5 years, as required by tax
          legislation.
        </li>
        <li>
          <strong>Application access logs:</strong> 6 months, pursuant to art. 15 of
          the Marco Civil da Internet (Law No. 12.965/2014).
        </li>
        <li>
          <strong>Aggregated and anonymized data</strong> that does not allow
          anyone to be identified may be retained for an indefinite period for
          statistical purposes and to improve the Service.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        12. Your Rights (art. 18 of the LGPD)
      </h2>
      <p>At any time and at no cost, you can:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Confirm</strong> that we process data about you;
        </li>
        <li>
          <strong>Access</strong> the data we hold about you;
        </li>
        <li>
          <strong>Correct</strong> incomplete, inaccurate, or outdated data;
        </li>
        <li>
          <strong>Request the anonymization, blocking, or deletion</strong> of
          unnecessary or excessive data, or data processed outside the law;
        </li>
        <li>
          <strong>Request portability</strong> of the data to another provider;
        </li>
        <li>
          <strong>Request the deletion</strong> of data processed on the basis of
          your consent;
        </li>
        <li>
          <strong>Find out who we share</strong> your data with;
        </li>
        <li>
          <strong>Revoke your consent</strong> and find out what happens if you do
          not give it;
        </li>
        <li>
          <strong>Object</strong> to processing carried out on the basis of
          legitimate interest.
        </li>
      </ul>
      <p>
        <strong>What you already do on your own, within the app:</strong> correct
        your registration data on the Profile screen; correct or delete entries and
        animals from the herd; and export your herd and your reports as a
        spreadsheet and as a PDF.
      </p>
      <p>
        <strong>What you request from us:</strong> a complete copy of your data,
        deletion of your account, and any of the other rights listed above. Write
        to{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com?subject=LGPD"
        >
          sistemaseabra@gmail.com
        </a>{' '}
        with the subject line &quot;LGPD&quot;. We may ask for additional
        information to confirm that it is really you — this is a protection for
        you, not an obstacle. <strong>We respond within 15 days.</strong>
      </p>
      <p>
        If our response does not satisfy you, you can file a complaint with the
        National Data Protection Authority (ANPD), at gov.br/anpd.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        13. Security
      </h2>
      <p>The measures we have adopted:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          All communication between the application and the servers is encrypted in
          transit (HTTPS/TLS).
        </li>
        <li>
          Passwords are stored only as a cryptographic hash — not even we can read
          them.
        </li>
        <li>
          Access to data is restricted at the database level itself through
          row-level security rules, so that an account can only reach the data it is
          entitled to.
        </li>
        <li>
          Access credentials are kept in the secure storage of the device operating
          system.
        </li>
        <li>Our database provider maintains periodic backups.</li>
        <li>
          Sensitive administrative actions are logged with author, date, and time.
        </li>
      </ul>
      <p>
        Even so, no system is entirely immune. If a security incident occurs that
        could cause you significant risk or harm, we will notify you and the ANPD,
        as required by art. 48 of the LGPD.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        14. Children and Adolescents
      </h2>
      <p>
        Sistema Seabra is a work tool and is not intended for anyone under 18 years
        of age. We do not intentionally collect data from children or adolescents.
        If we learn that an account was created by someone under 18 without the
        specific, prominently given consent of at least one parent or legal
        guardian, we will delete the data. If you are a parent or guardian and have
        noticed this, write to{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
        .
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        15. Links and Third-Party Services
      </h2>
      <p>
        The Service may direct you to third-party websites — associations,
        suppliers, technical material. We do not control these websites and are not
        responsible for their privacy practices. Read the policy of each one.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        16. Changes to This Policy
      </h2>
      <p>
        We may update this Policy. The &quot;Last updated&quot; date at the top
        always indicates the version in effect. When a change is material — a new
        purpose, new data sharing, a change in legal basis — we will notify you by
        email or through a prominent notice within the app before it takes effect.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        17. Contact
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Controller:</strong> SEABRA SOLUTIONS LTDA — CNPJ
          50.132.061/0001-80 — Florianópolis/SC, Brazil
        </li>
        <li>
          <strong>Data Protection Officer:</strong> Felipe Leal
        </li>
        <li>
          <strong>Email:</strong>{' '}
          <a
            className="text-primary hover:underline"
            href="mailto:sistemaseabra@gmail.com"
          >
            sistemaseabra@gmail.com
          </a>
        </li>
        <li>
          <strong>Website:</strong>{' '}
          <Link href="/" className="text-primary hover:underline">
            sistemaseabra.com.br
          </Link>
        </li>
      </ul>
      <p>
        This Policy is governed by Brazilian law. The courts of the judicial
        district (comarca) of Florianópolis, Santa Catarina, are elected to settle
        any disputes arising from it, except where the law guarantees the consumer
        the right to the forum of their domicile.
      </p>
    </>
  );
}
