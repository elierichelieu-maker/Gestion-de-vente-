import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Globe,
  Send,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const DEV_URL = 'https://ais-dev-gvemlrfxrtolychwakh7sp-730127915902.us-west2.run.app';
  const PRE_URL = 'https://ais-pre-gvemlrfxrtolychwakh7sp-730127915902.us-west2.run.app';

  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedPre, setCopiedPre] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (url: string, isDev: boolean) => {
    navigator.clipboard.writeText(url);
    if (isDev) {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2500);
    } else {
      setCopiedPre(true);
      setTimeout(() => setCopiedPre(false), 2500);
    }
  };

  const handleWhatsApp = (url: string) => {
    const text = `Voici le lien d'accès à l'application OptiVente Pro (Distribution Boissons & Caisse) :\n${url}\n\nOuvrez-le directement sur votre smartphone ou votre ordinateur.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Liens d'Accès & Partage</h3>
              <p className="text-[11px] text-slate-400">Pour connecter vos vendeurs, commerciaux et ordinateurs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Link 1: Direct Live Link (Dev) - Recommended */}
          <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>1. Lien Direct Actif (Recommandé)</span>
              </span>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Serveur en Ligne
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={DEV_URL}
                className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(DEV_URL, true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                  copiedDev
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-2xs'
                }`}
              >
                {copiedDev ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDev ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={DEV_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Tester l'ouverture dans un nouvel onglet</span>
              </a>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => handleWhatsApp(DEV_URL)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                <Send className="w-3 h-3" />
                <span>Envoyer sur WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Link 2: Shared Public Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">2. Lien Public Pré-release (ais-pre)</span>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Actif après "Share"
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={PRE_URL}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(PRE_URL, false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0 border cursor-pointer ${
                  copiedPre
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {copiedPre ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPre ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <p className="text-[10.5px] text-slate-500">
              Note : Ce lien 2 donne une erreur 404 tant que vous n'avez pas cliqué sur <strong>« Share »</strong> en haut à droite d'AI Studio. Utilisez le <strong>Lien 1 (ais-dev)</strong> ci-dessus qui est immédiatement en ligne !
            </p>
          </div>

          {/* Important Permission Notice */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Lock className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Pourquoi un lien peut refuser de s'ouvrir sur un autre appareil ?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Dans Google AI Studio, l'accès externe est protégé par défaut. Si vos collaborateurs voient un message d'erreur ou une demande de connexion Google :
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-blue-900">
              <li>
                Regardez <strong>tout en haut à droite</strong> de votre écran Google AI Studio.
              </li>
              <li>
                Cliquez sur le bouton <strong>« Share »</strong> (Partager).
              </li>
              <li>
                Réglez la visibilité sur <strong>« Anyone with the link »</strong> (Toute personne ayant le lien).
              </li>
            </ol>
          </div>

          {/* GitHub & Vercel Permanent Public Deployment */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <Globe className="w-4 h-4" />
                <span>Publier sur GitHub & Obtenir un Lien Vercel Gratuit</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Accès Sans Restriction
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pour que vos vendeurs et clients aient une adresse web permanente (ex: <code>optivente.vercel.app</code>) sans aucune restriction Google :
            </p>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10.5px] text-amber-300 space-y-1 select-all">
              <div># 1. Créez un dépôt "optivente-pro" sur votre compte github.com</div>
              <div>git remote add origin https://github.com/VOTRE_COMPTE/optivente-pro.git</div>
              <div>git push -u origin main</div>
            </div>
            <p className="text-[10.5px] text-slate-400">
              Ensuite sur <strong>vercel.com</strong> (gratuit), importez votre dépôt GitHub : votre application est en ligne en 30 secondes pour le monde entier !
            </p>
          </div>

          {/* Install as app guide */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Smartphone className="w-4 h-4 text-slate-700" />
              <span>Installation sur smartphone en 1 clic :</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Une fois le lien ouvert sur le téléphone du vendeur, appuyez sur <strong>« Partager » &gt; « Sur l'écran d'accueil »</strong> (iPhone) ou <strong>« Installer l'application »</strong> (Android).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
