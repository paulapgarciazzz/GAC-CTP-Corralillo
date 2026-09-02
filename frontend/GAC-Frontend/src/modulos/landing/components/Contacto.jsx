
import { useState } from 'react';
import ModalSolicitud from '../../SolicitudesAgrupaciones/components/ModalSolicitud';

const Contacto = () => {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <section id="contacto" className="scroll-mt-24 py-8 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#1f4d3a] dark:text-white">Información de Contacto</h2>
        <p className="text-xl font-bold text-center mb-6 text-[#1f4d3a] dark:text-white">Quieres formar parte de las actividades culturales?</p>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="block mx-auto -mt-2 mb-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Inscribete
        </button>
        <ModalSolicitud open={modalAbierto} onClose={() => setModalAbierto(false)} />
        <div className="max-w-3xl mx-auto bg-surface p-8 rounded-xl shadow-md border border-border">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-bold text-center text-[#1f4d3a] dark:text-white">📧 Correo</h4>
              <ul className="space-y-1 text-center text-foreground-soft">
                <li>ctp.decorralillo@mep.go.cr</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-center text-[#1f4d3a] dark:text-white">📞 Teléfonos</h4>
              <ul className="space-y-1 text-center text-foreground-soft">
                <li>Numero principal: +506 4500 1829</li>
              </ul>
            </div>
            <div className="sm:col-span-2 ">
              <h4 className="text-lg font-bold text-center text-[#1f4d3a] dark:text-white">🌐 Redes Sociales</h4>
              <div className="flex flex-wrap justify-center gap-4 text-foreground-soft">
                <a href="https://www.facebook.com/CTPDeCorralillo/?locale=es_LA" className="hover:text-accent transition">Facebook</a>
                <a href="https://www.instagram.com/ctpdecorralillo/" className=" hover:text-accent transition">Instagram</a>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-foreground-soft border-t border-border pt-4">
            <p>📍 Dirección: 150 mts Norte de la plaza de deportes, Corralillo, Nicoya, Guanacaste, Costa Rica</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;