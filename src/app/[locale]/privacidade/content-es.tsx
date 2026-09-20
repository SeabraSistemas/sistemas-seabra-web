import Link from 'next/link';

export function PrivacidadeContentEs() {
  return (
    <>
      <p>
        Esta Política explica qué datos recopila el Sistema Seabra, por qué
        los recopila, con quién los comparte, por cuánto tiempo los guarda y
        qué puede usted exigirnos. Sigue la Ley General de Protección de
        Datos (Ley n.º 13.709/2018 — LGPD).
      </p>
      <p>
        <strong>Quién responde por sus datos (responsable del tratamiento):</strong>{' '}
        SEABRA SOLUTIONS LTDA, inscrita en el CNPJ bajo el n.º
        50.132.061/0001-80, con sede en Florianópolis, Santa Catarina, Brasil
        — referida aquí como &quot;nosotros&quot; y &quot;nuestro&quot;.
      </p>
      <p>
        <strong>Servicio:</strong> el <strong>Sistema Seabra</strong>, en sus
        versiones para Android, iOS y web, y el sitio sistemaseabra.com.br.
      </p>
      <p>
        <strong>Contacto para privacidad:</strong>{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        1. Lo esencial, en una pantalla
      </h2>
      <p>
        El resto del documento detalla cada punto, pero si usted lee solo
        esta sección ya sabe lo principal:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>No vendemos sus datos</strong> ni los cedemos para fines
          publicitarios.
        </li>
        <li>
          <strong>No hay rastreadores publicitarios dentro de la
          aplicación.</strong> No usamos Google Analytics, Facebook SDK ni
          nada parecido.
        </li>
        <li>
          <strong>El rebaño registrado es suyo.</strong> Puede exportarlo en
          hoja de cálculo y en PDF cuando quiera, y pedir su eliminación.
        </li>
        <li>
          <strong>El dictado por voz no sale del dispositivo.</strong> El
          reconocimiento lo hace el propio celular; ningún audio se envía a
          servidor alguno.
        </li>
        <li>
          <strong>
            La cámara, el micrófono y la ubicación solo se acceden con su
            permiso
          </strong>
          , y nunca en segundo plano.
        </li>
        <li>
          <strong>
            El asistente de inteligencia artificial envía datos de su rebaño
            a un proveedor externo
          </strong>{' '}
          para poder responder. Si esto no le conviene, basta con no usar el
          asistente — la sección 6 lo explica en detalle.
        </li>
        <li>
          <strong>
            Usamos datos agregados y anonimizados para mejorar la aplicación
            y producir referencias para el sector
          </strong>{' '}
          — el nombre de su propiedad y de sus animales nunca aparece, y
          usted puede pedir quedar fuera. Sección 8.
        </li>
        <li>
          <strong>
            Aceptar la invitación de una asociación es compartir su rebaño
            con ella.
          </strong>{' '}
          Nada se comparte mientras usted no acepte, y la sección 7.3 dice
          exactamente qué pasa a ver la asociación.
        </li>
        <li>
          <strong>
            Usted puede pedir copia, corrección o eliminación de sus datos
          </strong>{' '}
          por correo electrónico, y respondemos en un plazo de hasta 15 días.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        2. Definiciones
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Servicio o Aplicación:</strong> el Sistema Seabra y el
          sitio sistemaseabra.com.br.
        </li>
        <li>
          <strong>Datos Personales:</strong> cualquier información que
          identifique o haga identificable a una persona natural.
        </li>
        <li>
          <strong>Tratamiento:</strong> cualquier operación realizada con
          Datos Personales — recopilar, guardar, usar, compartir, corregir,
          eliminar.
        </li>
        <li>
          <strong>Responsable (del tratamiento):</strong> quien decide cómo y
          por qué se tratan los datos.
        </li>
        <li>
          <strong>Encargado (del tratamiento):</strong> quien trata datos en
          nombre del responsable, siguiendo sus instrucciones — por ejemplo,
          la empresa que aloja nuestra base de datos.
        </li>
        <li>
          <strong>Titular:</strong> la persona a quien se refieren los Datos
          Personales — usted.
        </li>
        <li>
          <strong>Usuario:</strong> quien usa el Servicio. Puede ser
          productor, colaborador del productor, técnico o administrador de
          asociación.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        3. Quién usa el Sistema Seabra, y de quién es cada dato
      </h2>
      <p>
        El Sistema Seabra es usado por perfiles diferentes, y eso cambia
        quién responde por cada dato:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Productor:</strong> registra la propiedad y el rebaño. En
          relación con los datos de su propio rebaño, el productor es el
          responsable del tratamiento y nosotros actuamos como encargado —
          guardamos y procesamos esos datos a su servicio.
        </li>
        <li>
          <strong>Colaborador:</strong> persona que el productor invita a
          trabajar en su propiedad. Tiene cuenta propia y acceso limitado a
          lo que el productor autorice. El productor ve qué registros hizo
          cada colaborador.
        </li>
        <li>
          <strong>Técnico:</strong> profesional que atiende propiedades. Ve
          los datos de las propiedades que atiende, para realizar los
          servicios contratados.
        </li>
        <li>
          <strong>Administrador de asociación:</strong> gestiona a los
          técnicos y productores vinculados a su asociación, y ve los datos
          necesarios para ello.
        </li>
      </ul>
      <p>
        En relación con los datos de registro de cada usuario — nombre,
        correo electrónico, teléfono, CPF/CNPJ, datos de facturación —
        nosotros somos el responsable del tratamiento.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        4. Datos que recopilamos
      </h2>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.1. Datos que usted nos proporciona
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Nombre completo</li>
        <li>Dirección de correo electrónico</li>
        <li>
          Número de teléfono, usado también para WhatsApp y para el código de
          acceso
        </li>
        <li>
          Contraseña (guardada solo como resumen criptográfico; no tenemos
          acceso a ella)
        </li>
        <li>
          CPF (identificación fiscal individual brasileña) o CNPJ, cuando sea
          necesario para la suscripción, para la emisión de documento fiscal
          o para documentos oficiales de registro genealógico
        </li>
        <li>Dirección: código postal (CEP), municipio y estado</li>
        <li>Foto de perfil, si usted envía una</li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.2. Datos de la propiedad y del rebaño
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Nombre, ubicación y coordenadas geográficas de la propiedad</li>
        <li>
          Registro de los animales: número, arete, identificación
          electrónica, nombre, raza, pelaje, categoría, especie, sexo,
          fechas, genealogía y registro genealógico
        </li>
        <li>
          Registros de manejo, reproducción, pesaje, medidas, producción de
          leche, sanidad, nutrición, costo y movimiento
        </li>
        <li>
          Fotos de animales, aretes, exámenes y documentos que usted adjunte
        </li>
        <li>Visitas técnicas, servicios realizados y sus resultados</li>
      </ul>
      <p>
        La mayor parte de estos datos es sobre animales, no sobre personas —
        pero queda vinculada a su cuenta y a su propiedad, y por eso los
        tratamos con el mismo cuidado que damos a un dato personal.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.3. Datos recopilados automáticamente
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Dirección IP</li>
        <li>
          Identificador del dispositivo y código de envío de notificaciones
          (token de Firebase Cloud Messaging)
        </li>
        <li>Sistema operativo, versión del sistema y modelo del dispositivo</li>
        <li>Versión de la aplicación instalada</li>
        <li>Tipo y versión del navegador, en la versión web</li>
        <li>
          Registros de error y de sincronización, para descubrir por qué
          algo falló en su dispositivo
        </li>
        <li>
          Fecha y hora de los accesos y de los registros, con autoría — es lo
          que permite al productor saber quién registró qué
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.4. Permisos del dispositivo
      </h3>
      <p>
        Ninguno de estos permisos es obligatorio para usar el Servicio, y
        todos pueden revocarse en cualquier momento en la configuración de su
        dispositivo. Esto es lo que dejamos de hacer sin cada uno:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Cámara:</strong> fotografiar animales, aretes, exámenes y
          documentos, y usar la lectura de ficha por foto.
        </li>
        <li>
          <strong>Galería de fotos:</strong> adjuntar imágenes ya existentes
          en el dispositivo y guardar en ella los informes y fotos que genera
          la aplicación.
        </li>
        <li>
          <strong>Ubicación precisa:</strong> registrar la coordenada de la
          propiedad y de la visita técnica.{' '}
          <strong>Solo se lee cuando la aplicación está abierta y en
          uso</strong> — no monitoreamos su ubicación en segundo plano, ni
          armamos un historial de desplazamiento.
        </li>
        <li>
          <strong>Micrófono y reconocimiento de voz:</strong> completar
          campos por dictado en vez de escribir. El reconocimiento se
          ejecuta{' '}
          <strong>dentro del propio dispositivo</strong>; el audio no se
          graba ni se envía a ningún servidor, nuestro o de terceros.
        </li>
        <li>
          <strong>Notificaciones:</strong> avisar sobre partos previstos,
          secado, vacunación, visitas y cobros.
        </li>
        <li>
          <strong>Instalar aplicaciones (solo Android):</strong> aplicar la
          actualización del Sistema Seabra desde dentro de la propia
          aplicación, sin pasar por el navegador. Se usa solo para instalar
          el Sistema Seabra.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.5. Lo que no recopilamos
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          No tenemos SDK de publicidad ni rastreadores de terceros dentro de
          la aplicación.
        </li>
        <li>
          No usamos Google Analytics, Firebase Analytics, Meta Pixel ni
          equivalente dentro de la aplicación.
        </li>
        <li>
          No guardamos el número de la tarjeta de crédito — quien procesa el
          pago es Asaas (sección 7).
        </li>
        <li>
          No recopilamos datos sensibles en el sentido del art. 5, II de la
          LGPD: origen racial, convicción religiosa, opinión política,
          afiliación sindical, datos de salud, vida sexual, genéticos o
          biométricos de personas.
        </li>
        <li>No grabamos audio ni video en segundo plano.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        5. Por qué tratamos sus datos (bases legales — art. 7 de la LGPD)
      </h2>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.1. Ejecución del contrato (art. 7, V)
      </h3>
      <p>
        Crear y mantener su cuenta, autenticar el acceso, guardar y
        sincronizar el rebaño, generar informes, emitir documentos, procesar
        la suscripción y cobrarla, prestar soporte y avisar sobre eventos del
        rebaño que el Servicio se propuso avisar.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.2. Cumplimiento de obligación legal o regulatoria (art. 7, II)
      </h3>
      <p>
        Emitir documento fiscal, guardar registros contables y de acceso
        durante los plazos que exige la ley, y atender la determinación de
        autoridad competente.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.3. Interés legítimo (art. 7, IX)
      </h3>
      <p>
        Entender cómo se usa el Servicio para corregir defectos y mejorar el
        producto, prevenir fraude y abuso, garantizar la seguridad de las
        cuentas y administrar el Servicio. Siempre limitado a lo necesario, y
        siempre ponderado frente a sus derechos.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.4. Consentimiento (art. 7, I)
      </h3>
      <p>
        Acceso a la cámara, a la galería, a la ubicación y al micrófono;
        envío de comunicaciones de marketing; y uso del asistente de
        inteligencia artificial. Usted puede retirar el consentimiento en
        cualquier momento, sin que eso afecte lo que ya se hizo mientras
        estuvo vigente.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.5. Protección del crédito (art. 7, X)
      </h3>
      <p>
        Verificar la situación de su suscripción y gestionar el cobro de los
        valores adeudados.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        6. Asistente de inteligencia artificial
      </h2>
      <p>
        El Sistema Seabra tiene un asistente que responde preguntas sobre su
        rebaño. Merece una sección propia porque es el punto en que sus
        datos salen de nuestra infraestructura.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Lo que se envía:</strong> su pregunta y los datos de su
          rebaño necesarios para responderla — por ejemplo, la lista de
          animales, lactancias, pesajes o registros de manejo relacionados
          con lo que usted preguntó.
        </li>
        <li>
          <strong>Adónde va:</strong> al servicio de modelos de lenguaje{' '}
          <strong>Gemini, de Google LLC</strong>, en servidores fuera de
          Brasil.
        </li>
        <li>
          <strong>Lo que queda guardado:</strong> el historial de la
          conversación queda en nuestra base de datos, vinculado a su cuenta,
          para que usted pueda retomarla.
        </li>
        <li>
          <strong>Lo que no se envía:</strong> no enviamos su contraseña, su
          CPF ni sus datos de pago al asistente.
        </li>
        <li>
          <strong>Cómo no usarlo:</strong> el asistente solo recibe algo
          cuando usted le escribe. Si usted no abre el asistente, ningún dato
          suyo se envía por esa vía.
        </li>
      </ul>
      <p>
        La respuesta de un asistente de inteligencia artificial puede
        contener errores. No sustituye el juicio de un médico veterinario o
        zootecnista, y las decisiones de manejo, sanidad y reproducción
        siguen siendo suyas.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        7. Con quién compartimos
      </h2>
      <p>
        <strong>
          No vendemos datos personales ni los cedemos para publicidad de
          terceros.
        </strong>{' '}
        Compartimos solo lo necesario, y solo con:
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.1. Encargados que nos prestan servicio
      </h3>
      <p>
        Para funcionar, el Sistema Seabra depende de empresas que tratan
        datos en nuestro nombre, siguiendo nuestras instrucciones y con
        obligación contractual de proteger lo que reciben. Hoy son estas:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Alojamiento, base de datos y autenticación</strong> —
          Supabase Inc. Es donde quedan guardados sus datos.
        </li>
        <li>
          <strong>Notificaciones en el celular</strong> — Google LLC
          (Firebase Cloud Messaging), que recibe un identificador de su
          dispositivo.
        </li>
        <li>
          <strong>Asistente de inteligencia artificial</strong> — Google LLC
          (Gemini), en los términos de la sección 6.
        </li>
        <li>
          <strong>Suscripción y pago</strong> — Asaas, que recibe nombre,
          CPF o CNPJ, correo electrónico, teléfono y los datos del pago. El
          número de la tarjeta lo trata ella, no nosotros.
        </li>
        <li>
          <strong>Mensajes por WhatsApp</strong> — servidor de la propia
          Seabra Solutions. El mensaje circula por la red de WhatsApp,
          operada por Meta Platforms, como cualquier otro.
        </li>
      </ul>
      <p>
        Los proveedores cambian con el tiempo. La lista siempre actualizada
        está en{' '}
        <Link href="/operadores" className="text-primary hover:underline">
          sistemaseabra.com.br/operadores
        </Link>{' '}
        — si la versión de la aplicación que usted tiene es diferente, vale
        la del sitio.
      </p>
      <p>
        Además de los encargados, compartimos con{' '}
        <strong>asociaciones de registro genealógico</strong>, cuando usted
        emite o consulta un documento oficial, y con{' '}
        <strong>autoridades públicas</strong>, mediante determinación legal u
        orden judicial.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.2. Otros usuarios del Servicio
      </h3>
      <p>
        El Sistema Seabra está hecho para ser usado por más de una persona en
        torno al mismo rebaño. Por lo tanto:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          El <strong>colaborador</strong> que usted invita ve los datos de su
          propiedad que usted autorice, y usted ve lo que él registró.
        </li>
        <li>
          El <strong>técnico</strong> que atiende su propiedad ve los datos
          necesarios para el servicio, y el resultado del servicio queda en
          la ficha del animal.
        </li>
        <li>
          El <strong>administrador de la asociación</strong> a la que usted
          aceptó vincularse ve los datos de su propiedad — esto tiene una
          sección propia más abajo, porque depende de una aceptación suya y
          es el intercambio de datos más amplio de la aplicación.
        </li>
        <li>
          Cuando usted comparte un informe, una ficha o una hoja de cálculo
          generada por la aplicación,{' '}
          <strong>quien decide a quién se la envía es usted</strong> — y a
          partir de ahí el contenido queda con quien usted se lo envió.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.3. Cuando usted acepta la invitación de una asociación
      </h3>
      <p>
        Una asociación puede invitarlo a vincularse a ella. La invitación
        llega como una solicitud dentro de la aplicación, y{' '}
        <strong>nada se comparte mientras usted no acepte</strong>.
        Rechazarla no trae ninguna consecuencia para su cuenta ni para su
        rebaño.
      </p>
      <p>
        <strong>Aceptar la invitación es un acto de intercambio de
        datos.</strong>{' '}
        A partir de la aceptación, el administrador de la asociación pasa a
        ver:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>sus datos de registro — nombre, correo electrónico y teléfono;</li>
        <li>el efectivo de su rebaño y la ficha de sus animales;</li>
        <li>
          sus registros de manejo, pesaje, reproducción y control lechero,
          con fecha y autoría;
        </li>
        <li>
          los informes y las hojas de cálculo generados a partir de esos
          datos, que la asociación <strong>puede exportar</strong> fuera de
          la aplicación.
        </li>
      </ul>
      <p>
        La asociación usa esos datos para sus propios fines: seguimiento
        técnico del rebaño de los asociados, control lechero oficial,
        registro genealógico, estadística del plantel y los servicios que
        ella le ofrezca. En ese tratamiento{' '}
        <strong>
          la asociación es responsable de los datos que recibe y responde por
          ellos
        </strong>
        , y nosotros seguimos siendo el encargado. Lo que la asociación hace
        con esos datos se rige por su estatuto y por su política de
        privacidad — vale la pena conocerlos antes de aceptar.
      </p>
      <p>
        <strong>Cuando su asociación participa en su
        suscripción.</strong>{' '}
        Ella puede participar en el costo de dos formas:{' '}
        <strong>pagando la suscripción por usted</strong> u{' '}
        <strong>otorgando descuento</strong> a quien es asociado. Para
        aplicar cualquiera de las dos, ella nos informa quiénes son sus
        asociados.
      </p>
      <p>
        Cuando ella paga por usted, ve que su cuenta está activa y qué está
        costeando. Cuando es descuento, ve que usted usa el Sistema Seabra —
        es lo que permite reconocer el derecho al descuento. En ninguno de
        los dos casos ve sus datos de pago: quien los trata es el medio de
        pago indicado en la sección 7.1.
      </p>
      <p>
        Y en los dos casos, dos cosas no cambian: los datos de su rebaño
        siguen siendo suyos, y{' '}
        <strong>si usted sale de la asociación la cuenta sigue siendo
        suya</strong> — usted pasa a pagar el valor normal o vuelve al plan
        gratuito, sin perder nada de lo que registró.
      </p>
      <p>
        <strong>Para desvincularse</strong>, hable con la asociación o
        escriba a{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
        . La desvinculación termina el acceso de la asociación a sus datos de
        ahí en adelante, pero no deshace lo que ella ya haya exportado o
        registrado mientras el vínculo existía.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.4. Acceso de nuestro equipo
      </h3>
      <p>
        Nuestro equipo puede acceder a los datos de su cuenta a través de un
        panel administrativo interno. Esto es una operación de tratamiento y
        por eso está declarado aquí, y no oculto:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Para qué:</strong> prestar soporte cuando usted informa un
          problema, verificar y corregir datos, administrar la suscripción y
          el cobro, y producir, a pedido suyo, informes sobre su propio
          rebaño.
        </li>
        <li>
          <strong>Base legal:</strong> ejecución del contrato (art. 7, V) e
          interés legítimo en la administración del Servicio (art. 7, IX),
          siempre dentro del límite de esos fines.
        </li>
        <li>
          <strong>Quién accede:</strong> solo personas autorizadas de Seabra
          Solutions, cada una con cuenta nominal e individual.
        </li>
        <li>
          <strong>Lo que queda registrado:</strong> las acciones
          administrativas sobre cuentas y registros — en especial las
          eliminaciones — quedan grabadas con autor, fecha y hora.
        </li>
        <li>
          <strong>Lo que no hacemos con ese acceso:</strong> no usamos esos
          datos para otro fin, no los vendemos, no los cedemos y no los
          usamos para publicidad.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        8. Uso de sus datos para hacer evolucionar el sistema y la cadena
      </h2>
      <p>
        Queremos usar lo que el Sistema Seabra acumula para mejorar la propia
        aplicación y para producir conocimiento útil a la caprinocultura y a
        la ovinocultura brasileñas — parámetros de producción, curvas de
        crecimiento, referencias de eficiencia. Esta sección dice hasta dónde
        llegamos y dónde nos detenemos, porque es justamente el punto en que
        un productor tiene razón para desconfiar.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.1. Mejorar la aplicación
      </h3>
      <p>
        Analizamos cómo se usa el Sistema Seabra para descubrir qué falla,
        qué nadie encuentra y qué se traba, y para desarrollar funciones
        nuevas. La base legal es el interés legítimo (art. 7, IX, de la
        LGPD), y para esta finalidad el dato no sale de nuestra
        infraestructura.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.2. Estudio y estadística: solo con datos agregados y anonimizados
      </h3>
      <p>
        Para estudio, estadística y desarrollo de producto trabajamos con{' '}
        <strong>datos agregados y anonimizados</strong> — números que
        describen el conjunto, nunca su propiedad. Por ejemplo: la
        producción media por lactancia de una raza, la curva de peso de una
        categoría, la distribución del intervalo entre partos.
      </p>
      <p>Sobre estos datos asumimos cinco compromisos:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>
            El nombre, la marca, la ubicación y la identificación de su
            propiedad y de sus animales nunca entran
          </strong>{' '}
          en estudio, publicación, informe sectorial o comparativo.
        </li>
        <li>
          <strong>
            Ningún número se divulga cuando permita reconocer una propiedad.
          </strong>{' '}
          Un resultado solo se publica cuando reúne propiedades en cantidad
          suficiente para que ninguna sea identificable, y cuando ninguna
          propiedad aislada representa la mayor parte del resultado. Cuando
          ese mínimo no se alcanza, el recorte simplemente no se publica.
        </li>
        <li>
          <strong>No intentamos reidentificar</strong> a quien está detrás de
          un dato anonimizado, y exigimos por contrato lo mismo a quien
          reciba esos datos de nosotros.
        </li>
        <li>
          <strong>No vendemos su dato</strong>, agregado o no.
        </li>
        <li>
          <strong>Usted puede optar por no participar.</strong> La sección
          8.5 dice cómo.
        </li>
      </ul>
      <p>
        Anonimizado de esta forma, el dato deja de ser un dato personal en
        los términos del art. 12 de la LGPD — y por eso podemos conservarlo y
        usarlo incluso después de que usted cierre la cuenta. Lo que no
        haremos es llamar anonimizado a un dato que todavía permita llegar a
        alguien.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.3. Comparativos para usted e informes para el sector
      </h3>
      <p>
        Podemos mostrarle cómo se sitúa su rebaño en relación con el
        conjunto, y podemos publicar informes sectoriales para asociaciones,
        universidades, instituciones de investigación y prensa técnica. En
        ambos casos vale la regla de la sección 8.2: aparece el conjunto,
        nunca la propiedad. Usted ve su posición; nadie ve su propiedad
        dentro del número de los demás.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.4. Investigación y estudios con socios
      </h3>
      <p>
        Podemos participar en estudios realizados por universidades,
        institutos y organismos de investigación y asociaciones de
        criadores — por ejemplo, un estudio sobre el desempeño de una raza.
        Cuando eso ocurra:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Entregamos solo lo que el estudio necesita.</strong> En una
          investigación de raza, son los datos de los animales: genealogía,
          producción, peso, partos y cubriciones. Su nombre, CPF, teléfono y
          el nombre de su propiedad no se envían, porque no sirven a la
          investigación.
        </li>
        <li>
          <strong>
            Si el estudio puede realizarse con datos agregados y
            anonimizados, así es como se realiza.
          </strong>
        </li>
        <li>
          <strong>
            Si necesita su rebaño de forma identificable, pedimos su
            autorización antes
          </strong>{' '}
          — para ese estudio específico, en la aplicación (Perfil →
          Autorizaciones de investigación), indicando quién lo realiza, para
          qué y qué datos salen. Usted puede negarse, y puede revocar una
          autorización ya dada cuando quiera.
        </li>
        <li>
          <strong>Negarse no cambia nada.</strong> Ni en la aplicación, ni en
          su suscripción, ni en su asociación.
        </li>
        <li>
          <strong>Un estudio puede tener patrocinio de una empresa</strong>{' '}
          — de nutrición, sanidad o genética. Cuando lo tenga, decimos quién
          patrocina en el momento en que pedimos su autorización. Patrocinar
          no le da a la empresa acceso a su registro ni a su rebaño más allá
          de lo que el estudio abarca.
        </li>
        <li>
          <strong>No recibimos pago por entregar sus datos.</strong> Cuando
          hay pago, es por el trabajo de realizar el estudio.
        </li>
      </ul>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.5. Cómo optar por no participar
      </h3>
      <p>
        Desactívelo en la aplicación, en Perfil → Autorizaciones de
        investigación → &quot;Estudios y estadísticas del sector&quot;, o
        escriba a{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>{' '}
        pidiendo que sus datos no entren en las bases agregadas de estudio.
        Atendemos y confirmamos por escrito cuando el pedido es por correo
        electrónico. <strong>Usted no pierde ninguna funcionalidad</strong>{' '}
        de la aplicación por esto.
      </p>
      <p>
        Ese mismo pedido vale como oposición al tratamiento realizado con
        base en interés legítimo, prevista en el art. 18, § 2, de la LGPD.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        9. Dónde se procesan sus datos
      </h2>
      <p>
        Nuestros encargados — Supabase y Google — procesan datos en
        servidores ubicados fuera de Brasil, incluso en los Estados Unidos.
        La LGPD permite esta transferencia internacional, y esta se realiza
        bajo las cláusulas contractuales y las garantías de protección
        ofrecidas por estos proveedores, en un nivel equivalente al exigido
        por la ley brasileña.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        10. Datos guardados en su dispositivo
      </h2>
      <p>
        El Sistema Seabra funciona sin internet, y para eso guarda una copia
        de sus datos dentro del propio dispositivo:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Copia del rebaño, de los registros y de las configuraciones, para
          que usted trabaje en el corral sin señal.
        </li>
        <li>
          Cola de registros hechos sin internet, que se sincroniza en cuanto
          la conexión vuelve.
        </li>
        <li>
          Sus credenciales de acceso, guardadas en el depósito seguro del
          sistema operativo (Keychain en iOS, Keystore en Android), y no en
          un archivo común.
        </li>
      </ul>
      <p>
        Estos datos quedan en su dispositivo y se borran cuando usted
        desinstala la aplicación. Si el dispositivo es de uso compartido,
        cierre sesión de su cuenta al terminar.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        11. Por cuánto tiempo los guardamos
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Mientras su cuenta exista:</strong> mantenemos los datos
          necesarios para prestar el Servicio.
        </li>
        <li>
          <strong>Después del cierre de la cuenta:</strong> eliminamos o
          anonimizamos los Datos Personales en un plazo de hasta 90 días,
          salvo lo que la ley obligue a mantener.
        </li>
        <li>
          <strong>Datos fiscales y financieros:</strong> 5 años, por
          exigencia de la legislación tributaria.
        </li>
        <li>
          <strong>Registros de acceso a la aplicación:</strong> 6 meses,
          conforme al art. 15 del Marco Civil de Internet (Ley n.º
          12.965/2014).
        </li>
        <li>
          <strong>Datos agregados y anonimizados</strong>, que no permiten
          identificar a nadie, pueden mantenerse por plazo indeterminado para
          fines estadísticos y de mejora del Servicio.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        12. Sus derechos (art. 18 de la LGPD)
      </h2>
      <p>Usted puede, en cualquier momento y sin costo:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Confirmar</strong> que tratamos datos suyos;
        </li>
        <li>
          <strong>Acceder</strong> a los datos que tenemos sobre usted;
        </li>
        <li>
          <strong>Corregir</strong> datos incompletos, inexactos o
          desactualizados;
        </li>
        <li>
          <strong>Pedir la anonimización, el bloqueo o la eliminación</strong>{' '}
          de datos innecesarios, excesivos o tratados en contra de la ley;
        </li>
        <li>
          <strong>Pedir la portabilidad</strong> de los datos a otro proveedor;
        </li>
        <li>
          <strong>Pedir la eliminación</strong> de los datos tratados con
          base en su consentimiento;
        </li>
        <li>
          <strong>Saber con quién compartimos</strong> sus datos;
        </li>
        <li>
          <strong>Revocar el consentimiento</strong> y saber qué ocurre si
          usted no lo otorga;
        </li>
        <li>
          <strong>Oponerse</strong> a un tratamiento realizado con base en
          interés legítimo.
        </li>
      </ul>
      <p>
        <strong>Lo que usted ya hace por sí mismo, dentro de la
        aplicación:</strong> corregir sus datos de registro en la pantalla de
        Perfil; corregir o borrar registros y animales del rebaño; y
        exportar su rebaño y sus informes en hoja de cálculo y en PDF.
      </p>
      <p>
        <strong>Lo que usted nos pide a nosotros:</strong> copia completa de
        sus datos, eliminación de la cuenta y cualquiera de los demás
        derechos anteriores. Escriba a{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com?subject=LGPD"
        >
          sistemaseabra@gmail.com
        </a>{' '}
        con el asunto &quot;LGPD&quot;. Podemos pedir información adicional
        para confirmar que es usted mismo — es una protección suya, no un
        obstáculo. <strong>Respondemos en un plazo de hasta 15 días.</strong>
      </p>
      <p>
        Si la respuesta no lo satisface, usted puede presentar una
        reclamación ante la Autoridad Nacional de Protección de Datos (ANPD),
        en gov.br/anpd.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        13. Seguridad
      </h2>
      <p>Las medidas que adoptamos:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Toda comunicación entre la aplicación y los servidores está cifrada
          en tránsito (HTTPS/TLS).
        </li>
        <li>
          Las contraseñas se guardan solo como resumen criptográfico — ni
          siquiera nosotros podemos leerlas.
        </li>
        <li>
          El acceso a los datos está restringido en la propia base de datos
          por reglas de seguridad por fila (row-level security), de modo que
          una cuenta solo alcanza los datos a los que tiene derecho.
        </li>
        <li>
          Las credenciales de acceso quedan en el depósito seguro del sistema
          operativo del dispositivo.
        </li>
        <li>
          Nuestro proveedor de base de datos mantiene copias de seguridad
          periódicas.
        </li>
        <li>
          Las acciones administrativas sensibles quedan registradas con
          autor, fecha y hora.
        </li>
      </ul>
      <p>
        Aun así, ningún sistema es totalmente inmune. Si ocurre un incidente
        de seguridad que pueda acarrear riesgo o daño relevante para usted,
        se lo comunicaremos a usted y a la ANPD, como exige el art. 48 de la
        LGPD.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        14. Niños, niñas y adolescentes
      </h2>
      <p>
        El Sistema Seabra es una herramienta de trabajo y no está destinado a
        menores de 18 años. No recopilamos intencionalmente datos de niños,
        niñas o adolescentes. Si tenemos conocimiento de que una cuenta fue
        creada por un menor de 18 años sin el consentimiento específico y
        destacado de al menos uno de los padres o del responsable legal,
        eliminaremos los datos. Si usted es padre, madre o responsable y lo
        notó, escriba a{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
        .
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        15. Enlaces y servicios de terceros
      </h2>
      <p>
        El Servicio puede llevarlo a sitios de terceros — asociaciones,
        proveedores, material técnico. No controlamos esos sitios y no
        respondemos por sus prácticas de privacidad. Lea la política de cada
        uno.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        16. Cambios en esta Política
      </h2>
      <p>
        Podemos actualizar esta Política. La fecha de &quot;Última
        actualización&quot;, en la parte superior, siempre indica la versión
        vigente. Cuando el cambio sea relevante — nueva finalidad, nuevo
        intercambio de datos, cambio de base legal — avisaremos por correo
        electrónico o por aviso destacado dentro de la aplicación antes de
        que entre en vigor.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        17. Contacto
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Responsable del tratamiento:</strong> SEABRA SOLUTIONS
          LTDA — CNPJ 50.132.061/0001-80 — Florianópolis/SC, Brasil
        </li>
        <li>
          <strong>Delegado de Protección de Datos (DPO):</strong>{' '}
          Felipe Leal
        </li>
        <li>
          <strong>Correo electrónico:</strong>{' '}
          <a
            className="text-primary hover:underline"
            href="mailto:sistemaseabra@gmail.com"
          >
            sistemaseabra@gmail.com
          </a>
        </li>
        <li>
          <strong>Sitio web:</strong>{' '}
          <Link href="/" className="text-primary hover:underline">
            sistemaseabra.com.br
          </Link>
        </li>
      </ul>
      <p>
        Esta Política se rige por la ley brasileña. Queda elegido el foro de
        la comarca de Florianópolis, Santa Catarina, para dirimir las
        cuestiones que de ella se deriven, salvo cuando la ley garantice al
        consumidor el foro de su domicilio.
      </p>
    </>
  );
}
