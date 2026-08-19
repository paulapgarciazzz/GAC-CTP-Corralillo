
const Contacto = () => {
  return (
    <section id="contacto" className="scroll-mt-24 py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Información de Contacto</h2>
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-xl shadow-md">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-blue-600 mb-2">📧 Correo</h4>
              <ul className="space-y-1 text-gray-700">
                <li>ctp.decorralillo@mep.go.cr</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-600 mb-2">📞 Teléfonos</h4>
              <ul className="space-y-1 text-gray-700">
                <li>+506 8888-9999 (WhatsApp)</li>
                <li>+506 2687 8014</li>
                <li>Central: +506 4500 1829</li>
              </ul>
            </div>
            <div className="sm:col-span-2">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">🌐 Redes Sociales</h4>
              <div className="flex flex-wrap gap-4 text-gray-700">
                <a href="https://www.facebook.com/CTPDeCorralillo/?locale=es_LA" className="hover:text-blue-500 transition">Facebook</a>
                <a href="https://www.instagram.com/ctpdecorralillo/" className="hover:text-blue-500 transition">Instagram</a>
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