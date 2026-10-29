import site from '../data/site.json';
import { txt, WHITE } from '../styles';

export default function Footer() {
  const { footer } = site;
  return (
    <footer
      className="bg-[#081622] text-white px-5 lg:px-8 py-8"
      style={{ background: 'rgb(8, 22, 34)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 justify-between">
        <p className="font-semibold" style={txt(WHITE, 16)}>
          {footer.name}
        </p>
        <p className="text-sm text-[#b8cbd0] max-w-xl" style={txt('rgb(184, 203, 208)', 14)}>
          {footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
