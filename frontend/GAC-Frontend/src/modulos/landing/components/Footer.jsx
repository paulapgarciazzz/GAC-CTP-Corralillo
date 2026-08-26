const Footer = () => {
  return (
    
    <footer className="bg-rail text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} CTP de Corralillo - Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;