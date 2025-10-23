import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


const resources = {
  en: {
    translation: {

      welcome: 'Welcome',
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      phone: 'Phone',
      name: 'Name',
      location: 'Location',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      retry: 'Retry',


      appName: 'NourishNet',
      tagline: 'Connect Surplus to Need',
      getStarted: 'Get Started',
      forgotPassword: 'Forgot Password?',
      signUp: 'Sign Up',
      role: 'Role',
      donor: 'Donor',
      recipient: 'Recipient',
      volunteer: 'Volunteer',
      householdSize: 'Household Size',
      privacyPolicy: 'I agree to the Privacy Policy',


      home: 'Home',
      post: 'Post',
      profile: 'Profile',
      alerts: 'Alerts',


      addDonation: 'Add Donation',
      itemName: 'Item Name',
      description: 'Description',
      quantity: 'Quantity',
      expiryDate: 'Expiry Date',
      pickupTime: 'Pickup Time',
      claim: 'Claim',
      reserved: 'Reserved',
      report: 'Report',
      chat: 'Chat',


      newDonationNearby: 'New donation nearby',
      donationClaimed: 'Donation claimed',
      pickupReminder: 'Pickup reminder',


      notifications: 'Notifications',
      language: 'Language',
      lowDataMode: 'Low Data Mode',
      logout: 'Logout',


      slide1Title: 'Post Donations Easily',
      slide1Description: 'Share surplus food with those in need',
      slide2Title: 'Find Food Nearby',
      slide2Description: 'Discover donations in your community',
      slide3Title: 'Make a Difference',
      slide3Description: 'Help combat food insecurity together',
    }
  },
  zu: {
    translation: {

      welcome: 'Siyakwamukela',
      login: 'Ngena',
      register: 'Bhalisa',
      email: 'I-imeyili',
      password: 'Iphasiwedi',
      phone: 'Ucingo',
      name: 'Igama',
      location: 'Indawo',
      save: 'Gcina',
      cancel: 'Khansela',
      confirm: 'Qinisekisa',
      delete: 'Susa',
      edit: 'Hlela',
      search: 'Sesha',
      filter: 'Hlunga',
      sort: 'Hlela',
      loading: 'Iyalayisha...',
      error: 'Iphutha',
      success: 'Impumelelo',
      retry: 'Zama futhi',


      appName: 'NourishNet',
      tagline: 'Xhuma Okusele Nokudingekayo',
      getStarted: 'Qala',
      forgotPassword: 'Ukhohlwe Iphasiwedi?',
      signUp: 'Bhalisa',
      role: 'Indima',
      donor: 'Umnikeli',
      recipient: 'Umamukeli',
      volunteer: 'Umsebenzi wamavolontiya',
      householdSize: 'Usayizi Womndeni',
      privacyPolicy: 'Ngiyavuma ne-Privacy Policy',


      home: 'Ikhaya',
      post: 'Thumela',
      profile: 'Iphrofayili',
      alerts: 'Izexwayiso',


      addDonation: 'Engeza Isipho',
      itemName: 'Igama Lentu',
      description: 'Incazelo',
      quantity: 'Ubuningi',
      expiryDate: 'Usuku Lokuphela',
      pickupTime: 'Isikhathi Sokuthatha',
      claim: 'Funa',
      reserved: 'Kugciniwe',
      report: 'Bika',
      chat: 'Xoxa',


      newDonationNearby: 'Isipho esisha eduze',
      donationClaimed: 'Isipho sithathwe',
      pickupReminder: 'Isikhumbuzi sokuthatha',


      notifications: 'Izaziso',
      language: 'Ulimi',
      lowDataMode: 'Imodi Yedatha Ephantsi',
      logout: 'Phuma',


      slide1Title: 'Thumela Izipho Kalula',
      slide1Description: 'Yabelana ngokudla okusele nabadingayo',
      slide2Title: 'Thola Ukudla Eduze',
      slide2Description: 'Thola izipho emphakathini wakho',
      slide3Title: 'Yenza Umehluko',
      slide3Description: 'Siza ukulwa nokungabi nokudla ndawonye',
    }
  },
  af: {
    translation: {

      welcome: 'Welkom',
      login: 'Teken In',
      register: 'Registreer',
      email: 'E-pos',
      password: 'Wagwoord',
      phone: 'Foon',
      name: 'Naam',
      location: 'Ligging',
      save: 'Stoor',
      cancel: 'Kanselleer',
      confirm: 'Bevestig',
      delete: 'Skrap',
      edit: 'Wysig',
      search: 'Soek',
      filter: 'Filter',
      sort: 'Sorteer',
      loading: 'Laai...',
      error: 'Fout',
      success: 'Sukses',
      retry: 'Probeer Weer',


      appName: 'NourishNet',
      tagline: 'Verbind Oorskot met Behoefte',
      getStarted: 'Begin',
      forgotPassword: 'Wagwoord Vergeet?',
      signUp: 'Registreer',
      role: 'Rol',
      donor: 'Skenker',
      recipient: 'Ontvanger',
      volunteer: 'Vrywilliger',
      householdSize: 'Huishouding Grootte',
      privacyPolicy: 'Ek stem saam met die Privaatheidsbeleid',


      home: 'Tuis',
      post: 'Plaas',
      profile: 'Profiel',
      alerts: 'Waarskuwings',


      addDonation: 'Voeg Skenking By',
      itemName: 'Item Naam',
      description: 'Beskrywing',
      quantity: 'Hoeveelheid',
      expiryDate: 'Verval Datum',
      pickupTime: 'Optel Tyd',
      claim: 'Eis',
      reserved: 'Gereserveer',
      report: 'Rapporteer',
      chat: 'Gesels',


      newDonationNearby: 'Nuwe skenking naby',
      donationClaimed: 'Skenking geëis',
      pickupReminder: 'Optel herinnering',


      notifications: 'Kennisgewings',
      language: 'Taal',
      lowDataMode: 'Lae Data Modus',
      logout: 'Teken Uit',


      slide1Title: 'Plaas Skenkings Maklik',
      slide1Description: 'Deel oorskot kos met die wat dit nodig het',
      slide2Title: 'Vind Kos Naby',
      slide2Description: 'Ontdek skenkings in jou gemeenskap',
      slide3Title: 'Maak n Verskil',
      slide3Description: 'Help om kosonsekerheid saam te beveg',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
    react: {
      useSuspense: false,
    },
  });

export default i18n;
