import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'fr' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navbar
        'nav.features': 'Features',
        'nav.about': 'About',
        'nav.howItWorks': 'How It Works',
        'nav.support': 'Support',
        'nav.login': 'Staff Login',
        'nav.register': 'Register',

        // Hero
        'hero.tag': 'EST. OFFICE OF THE REGISTRY',
        'hero.title.part1': 'The ',
        'hero.title.highlight': 'Premier',
        'hero.title.part2': ' Academic Board Ecosystem.',
        'hero.subtitle': 'Secure, real-time collaboration designed exclusively for institutional governance at the University of Mines and Technology.',
        'hero.cta': 'Access Board Portal',
        'hero.stat.members': 'Board Members',
        'hero.stat.archives': 'Archives',
        'hero.stat.reliability': 'Reliability',

        // Features
        'features.tag': 'CORE ARCHITECTURE',
        'features.title': 'Institutional Sovereignty.',
        'features.subtitle': 'A bespoke digital ecosystem engineered for the specific governance requirements of the UMaT Academic Board.',
        'features.1.title': 'Governance Security',
        'features.1.desc': 'End-to-end encrypted storage for institutional policies and sensitive board minutes.',
        'features.2.title': 'Semantic Discovery',
        'features.2.desc': 'Multi-year archive search powered by full-text indexing and smart categorization.',
        'features.3.title': 'Board Collaboration',
        'features.3.desc': 'Live threaded discussions and private annotations on shared academic documents.',

        // Stats Bar
        'stats.boards': 'Academic Boards',
        'stats.papers': 'Research Papers',
        'stats.security': 'Security Grade',
        'stats.availability': 'Availability'
    },
    fr: {
        // Navbar
        'nav.features': 'Fonctionnalités',
        'nav.about': 'À propos',
        'nav.howItWorks': 'Comment ça marche',
        'nav.support': 'Support',
        'nav.login': 'Connexion Personnel',
        'nav.register': 'S\'inscrire',

        // Hero
        'hero.tag': 'ÉTABLI BUREAU DU REGISTRE',
        'hero.title.part1': 'L\'écosystème ',
        'hero.title.highlight': 'Premier',
        'hero.title.part2': ' du conseil académique.',
        'hero.subtitle': 'Une collaboration sécurisée en temps réel conçue exclusivement pour la gouvernance institutionnelle à l\'Université des Mines et de la Technologie.',
        'hero.cta': 'Accéder au Portail',
        'hero.stat.members': 'Membres du Conseil',
        'hero.stat.archives': 'Archives',
        'hero.stat.reliability': 'Fiabilité',

        // Features
        'features.tag': 'ARCHITECTURE DE BASE',
        'features.title': 'Souveraineté Institutionnelle.',
        'features.subtitle': 'Un écosystème numérique sur mesure conçu pour les exigences spécifiques de gouvernance du conseil académique de l\'UMaT.',
        'features.1.title': 'Sécurité de la Gouvernance',
        'features.1.desc': 'Stockage crypté de bout en bout pour les politiques institutionnelles et les procès-verbaux sensibles.',
        'features.2.title': 'Découverte Sémantique',
        'features.2.desc': 'Recherche d\'archives sur plusieurs années alimentée par l\'indexation plein texte et la catégorisation intelligente.',
        'features.3.title': 'Collaboration du Conseil',
        'features.3.desc': 'Discussions en direct et annotations privées sur les documents académiques partagés.',

        // Stats Bar
        'stats.boards': 'Conseils Académiques',
        'stats.papers': 'Documents de Recherche',
        'stats.security': 'Niveau de Sécurité',
        'stats.availability': 'Disponibilité'
    },
    es: {
        // Navbar
        'nav.features': 'Características',
        'nav.about': 'Acerca de',
        'nav.howItWorks': 'Cómo funciona',
        'nav.support': 'Soporte',
        'nav.login': 'Inicio del Personal',
        'nav.register': 'Registrarse',

        // Hero
        'hero.tag': 'EST. OFICINA DEL REGISTRO',
        'hero.title.part1': 'El Ecosistema ',
        'hero.title.highlight': 'Principal',
        'hero.title.part2': ' de la Junta Académica.',
        'hero.subtitle': 'Colaboración segura en tiempo real diseñada exclusivamente para el gobierno institucional en la Universidad de Minas y Tecnología.',
        'hero.cta': 'Acceder al Portal',
        'hero.stat.members': 'Miembros de la Junta',
        'hero.stat.archives': 'Archivos',
        'hero.stat.reliability': 'Fiabilidad',

        // Features
        'features.tag': 'ARQUITECTURA PRINCIPAL',
        'features.title': 'Soberanía Institucional.',
        'features.subtitle': 'Un ecosistema digital a medida diseñado para los requisitos de gobierno específicos de la Junta Académica de UMaT.',
        'features.1.title': 'Seguridad de Gobierno',
        'features.1.desc': 'Almacenamiento cifrado de extremo a extremo para políticas institucionales y actas de la junta sensibles.',
        'features.2.title': 'Descubrimiento Semántico',
        'features.2.desc': 'Búsqueda de archivos de varios años impulsada por indexación de texto completo y categorización inteligente.',
        'features.3.title': 'Colaboración de la Junta',
        'features.3.desc': 'Discusiones en vivo y anotaciones privadas en documentos académicos compartidos.',

        // Stats Bar
        'stats.boards': 'Juntas Académicas',
        'stats.papers': 'Documentos de Investigación',
        'stats.security': 'Nivel de Seguridad',
        'stats.availability': 'Disponibilidad'
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
