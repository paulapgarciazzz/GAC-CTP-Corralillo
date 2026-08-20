
import { useState } from 'react';
import ModalSolicitud from '../../SolicitudesAgrupaciones/components/ModalSolicitud';

const Contacto = () => {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <section id="contacto" className="scroll-mt-24 py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Información de Contacto</h2>
        <p className="text-xl font-bold text-center mb-12">Quieres formar parte de las actividades culturales?</p>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="block mx-auto -mt-6 px-6 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Inscribete
        </button>
        <ModalSolicitud open={modalAbierto} onClose={() => setModalAbierto(false)} />
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-xl shadow-md">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-center text-blue-600 mb-2">📧 Correo</h4>
              <ul className="space-y-1 text-center text-gray-700">
                <li>ctp.decorralillo@mep.go.cr</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-center text-blue-600 mb-2">📞 Teléfonos</h4>
              <ul className="space-y-1 text-center text-gray-700">
                <li>+506 8888-9999 (WhatsApp)</li>
                <li>+506 2687 8014</li>
                <li>+506 4500 1829</li>
              </ul>
            </div>
            <div className="sm:col-span-2 ">
              <h4 className="text-lg font-semibold text-center text-blue-600 mb-2">🌐 Redes Sociales</h4>
              <div className="flex flex-wrap justify-center gap-4 text-gray-700">
                <a href="https://www.facebook.com/CTPDeCorralillo/?locale=es_LA" className="hover:text-blue-500 transition">Facebook</a>
                <a href="https://www.instagram.com/ctpdecorralillo/" className=" hover:text-blue-500 transition">Instagram</a>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-600 border-t pt-4">
            <p>📍 Dirección: 150 mts Norte de la plaza de deportes, Corralillo, Nicoya, Guanacaste, Costa Rica</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;