export type Language = "en" | "hi";

export const LANGUAGE_COOKIE = "civicai_lang";

const en = {
  common: {
    login: "Login", logout: "Logout", back: "Back", cancel: "Cancel", save: "Save Changes",
    continue_: "Continue", submit: "Submit", loading: "Loading...", viewAll: "View All",
    reportProblem: "Report a Problem", adminLogin: "Admin Login", departmentLogin: "Staff Login",
  },
  nav: {
    dashboard: "Dashboard", reportProblem: "Report Problem", myComplaints: "My Complaints", map: "Map",
    notifications: "Notifications", profile: "Profile", allComplaints: "All Complaints",
    priorityQueue: "Priority Queue", heatmap: "Heatmap", analytics: "Analytics", users: "Users",
    departments: "Departments", settings: "Settings", assignedComplaints: "Assigned Complaints",
    inProgress: "In Progress", resolved: "Resolved",
  },
  home: {
    tagline: "Report Problems. Improve Your City.",
    heroTitle: "AI-Powered Civic Problem Reporting",
    heroSubtitle: "Help build cleaner, safer and smarter communities by reporting civic problems in seconds.",
    featureAiTitle: "AI Image Analysis",
    featureAiText: "Upload a photo and get the category, severity and responsible department in seconds.",
    featurePriorityTitle: "Priority Queue",
    featurePriorityText: "Complaints are scored 0-100 so administrators can triage the most urgent issues first.",
    featureDupTitle: "Duplicate Detection",
    featureDupText: "Reports of the same problem are grouped without removing any citizen's complaint.",
  },
  dashboard: {
    welcome: "Welcome", overview: "Here is an overview of your civic reports.",
    totalComplaints: "Total Complaints", pending: "Pending", inProgress: "In Progress", resolved: "Resolved",
    recentComplaints: "Recent Complaints", noComplaintsTitle: "No complaints yet",
    noComplaintsText: "Report your first civic problem and our AI will analyze it instantly.",
  },
  report: {
    title: "Report a Problem", subtitle: "Follow the steps below. Our AI will analyze your report automatically.",
    stepPhoto: "Photo", stepDetails: "Details", stepLocation: "Location", stepAnalysis: "AI Analysis", stepSubmit: "Submit",
    addEvidence: "Add Evidence", takePhoto: "Take Photo", chooseGallery: "Choose from Gallery",
    replace: "Replace", remove: "Remove", supportedFormats: "JPG, JPEG, PNG or WEBP, up to 5 MB.",
    locationTitle: "Location", useLiveLocation: "Use Live Location", selectOnMap: "Select on Map",
    locating: "Locating...", confirmLocation: "Confirm Location", selectedLocation: "Selected Location",
    latitude: "Latitude", longitude: "Longitude", address: "Address",
    permissionDenied: "Location permission was denied. Please select your location manually.",
    descriptionTitle: "Add a Description (optional)",
    descriptionSubtitle: "Add any extra detail that might help the AI and administrators.",
    descriptionPlaceholder: "e.g. This pothole has been here for two weeks and causes traffic.",
    analyzeWithAI: "Analyze with AI", analyzing: "Analyzing",
    previewTitle: "AI-Generated Complaint Preview",
    aiUnavailable: "AI analysis was unavailable, so default values are shown. You can still submit; an administrator will review it.",
    lowConfidence: "Unable to confidently identify the problem from the image. An administrator will review it.",
    fieldTitle: "Title", fieldCategory: "Category", fieldSeverity: "Severity", fieldPriority: "Priority",
    fieldDepartment: "Department", fieldConfidence: "Confidence", fieldDescription: "Description", fieldImpact: "Possible Impact",
    submitComplaint: "Submit Complaint", submittedTitle: "Complaint submitted",
    submittedSubtitle: "Thank you for helping improve your city.", complaintId: "Complaint ID",
    priorityScore: "Priority Score", similarReports: "Similar Reports",
    viewMyComplaints: "View My Complaints", backToDashboard: "Back to Dashboard",
    stageUploading: "Uploading image", stageAnalyzing: "Analyzing image", stageDetecting: "Detecting problem",
    stageLocationCheck: "Checking location", stagePriority: "Calculating priority", stagePreparing: "Preparing complaint",
  },
  complaints: {
    title: "My Complaints", noneTitle: "No complaints yet",
    noneText: "Report your first civic problem to see it listed here.",
    timeline: "Status Timeline", rejectedNote: "This complaint was rejected by an administrator.",
    adminNotes: "Administrator Notes", resolution: "Resolution", before: "Before", after: "After",
  },
  status: {
    PENDING: "Pending", UNDER_REVIEW: "Under Review", ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress", RESOLVED: "Resolved", REJECTED: "Rejected",
  },
  severity: { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" },
  notifications: {
    title: "Notifications", subtitle: "Updates about your civic reports.",
    none: "No notifications yet", markRead: "Mark read",
  },
  profile: {
    title: "Profile", subtitle: "Manage your account details.", fullName: "Full Name",
    phone: "Phone", email: "Email", role: "Role", saveChanges: "Save Changes", saved: "Profile updated.",
  },
  errors: { generic: "Something went wrong. Please try again.", network: "Could not reach the server. Check your connection and try again." },
};

type Dict = typeof en;

const hi: Dict = {
  common: {
    login: "लॉग इन", logout: "लॉग आउट", back: "वापस", cancel: "रद्द करें", save: "बदलाव सहेजें",
    continue_: "जारी रखें", submit: "जमा करें", loading: "लोड हो रहा है...", viewAll: "सभी देखें",
    reportProblem: "समस्या दर्ज करें", adminLogin: "एडमिन लॉगिन", departmentLogin: "स्टाफ लॉगिन",
  },
  nav: {
    dashboard: "डैशबोर्ड", reportProblem: "समस्या दर्ज करें", myComplaints: "मेरी शिकायतें", map: "मानचित्र",
    notifications: "सूचनाएं", profile: "प्रोफ़ाइल", allComplaints: "सभी शिकायतें",
    priorityQueue: "प्राथमिकता सूची", heatmap: "हीटमैप", analytics: "विश्लेषण", users: "उपयोगकर्ता",
    departments: "विभाग", settings: "सेटिंग्स", assignedComplaints: "सौंपी गई शिकायतें",
    inProgress: "प्रगति में", resolved: "सुलझाई गई",
  },
  home: {
    tagline: "समस्याएं दर्ज करें। अपने शहर को बेहतर बनाएं।",
    heroTitle: "एआई-संचालित नागरिक समस्या रिपोर्टिंग",
    heroSubtitle: "कुछ ही सेकंड में नागरिक समस्याओं की रिपोर्ट करके स्वच्छ, सुरक्षित और स्मार्ट समुदाय बनाने में मदद करें।",
    featureAiTitle: "एआई छवि विश्लेषण",
    featureAiText: "एक फोटो अपलोड करें और कुछ ही सेकंड में श्रेणी, गंभीरता और जिम्मेदार विभाग प्राप्त करें।",
    featurePriorityTitle: "प्राथमिकता सूची",
    featurePriorityText: "शिकायतों को 0-100 तक स्कोर किया जाता है ताकि प्रशासक सबसे जरूरी मुद्दों को पहले देख सकें।",
    featureDupTitle: "डुप्लिकेट पहचान",
    featureDupText: "एक ही समस्या की रिपोर्टों को बिना किसी नागरिक की शिकायत हटाए समूहित किया जाता है।",
  },
  dashboard: {
    welcome: "स्वागत है", overview: "यह रहा आपकी नागरिक रिपोर्टों का विवरण।",
    totalComplaints: "कुल शिकायतें", pending: "लंबित", inProgress: "प्रगति में", resolved: "सुलझाई गई",
    recentComplaints: "हाल की शिकायतें", noComplaintsTitle: "अभी तक कोई शिकायत नहीं",
    noComplaintsText: "अपनी पहली नागरिक समस्या दर्ज करें और हमारा एआई इसका तुरंत विश्लेषण करेगा।",
  },
  report: {
    title: "समस्या दर्ज करें", subtitle: "नीचे दिए गए चरणों का पालन करें। हमारा एआई आपकी रिपोर्ट का स्वतः विश्लेषण करेगा।",
    stepPhoto: "फोटो", stepDetails: "विवरण", stepLocation: "स्थान", stepAnalysis: "एआई विश्लेषण", stepSubmit: "जमा करें",
    addEvidence: "प्रमाण जोड़ें", takePhoto: "फोटो लें", chooseGallery: "गैलरी से चुनें",
    replace: "बदलें", remove: "हटाएं", supportedFormats: "JPG, JPEG, PNG या WEBP, अधिकतम 5 MB।",
    locationTitle: "स्थान", useLiveLocation: "लाइव लोकेशन उपयोग करें", selectOnMap: "मानचित्र पर चुनें",
    locating: "स्थान खोजा जा रहा है...", confirmLocation: "स्थान की पुष्टि करें", selectedLocation: "चयनित स्थान",
    latitude: "अक्षांश", longitude: "देशांतर", address: "पता",
    permissionDenied: "स्थान की अनुमति अस्वीकार कर दी गई। कृपया मानचित्र पर स्वयं स्थान चुनें।",
    descriptionTitle: "विवरण जोड़ें (वैकल्पिक)",
    descriptionSubtitle: "कोई अतिरिक्त जानकारी जोड़ें जो एआई और प्रशासकों की मदद कर सके।",
    descriptionPlaceholder: "उदा. यह गड्ढा दो सप्ताह से यहाँ है और ट्रैफिक का कारण बनता है।",
    analyzeWithAI: "एआई से विश्लेषण करें", analyzing: "विश्लेषण हो रहा है",
    previewTitle: "एआई-जनित शिकायत पूर्वावलोकन",
    aiUnavailable: "एआई विश्लेषण उपलब्ध नहीं था, इसलिए डिफ़ॉल्ट मान दिखाए गए हैं। आप फिर भी जमा कर सकते हैं; एक प्रशासक इसकी समीक्षा करेगा।",
    lowConfidence: "छवि से समस्या की पुष्टि नहीं हो पाई। एक प्रशासक इसकी समीक्षा करेगा।",
    fieldTitle: "शीर्षक", fieldCategory: "श्रेणी", fieldSeverity: "गंभीरता", fieldPriority: "प्राथमिकता",
    fieldDepartment: "विभाग", fieldConfidence: "विश्वास स्तर", fieldDescription: "विवरण", fieldImpact: "संभावित प्रभाव",
    submitComplaint: "शिकायत जमा करें", submittedTitle: "शिकायत जमा हो गई",
    submittedSubtitle: "अपने शहर को बेहतर बनाने में मदद करने के लिए धन्यवाद।", complaintId: "शिकायत आईडी",
    priorityScore: "प्राथमिकता स्कोर", similarReports: "समान रिपोर्टें",
    viewMyComplaints: "मेरी शिकायतें देखें", backToDashboard: "डैशबोर्ड पर वापस जाएं",
    stageUploading: "छवि अपलोड हो रही है", stageAnalyzing: "छवि का विश्लेषण हो रहा है", stageDetecting: "समस्या की पहचान हो रही है",
    stageLocationCheck: "स्थान जांचा जा रहा है", stagePriority: "प्राथमिकता की गणना हो रही है", stagePreparing: "शिकायत तैयार हो रही है",
  },
  complaints: {
    title: "मेरी शिकायतें", noneTitle: "अभी तक कोई शिकायत नहीं",
    noneText: "अपनी पहली नागरिक समस्या दर्ज करें ताकि वह यहाँ सूचीबद्ध हो।",
    timeline: "स्थिति समयरेखा", rejectedNote: "इस शिकायत को एक प्रशासक द्वारा अस्वीकार कर दिया गया था।",
    adminNotes: "प्रशासक टिप्पणियाँ", resolution: "समाधान", before: "पहले", after: "बाद में",
  },
  status: {
    PENDING: "लंबित", UNDER_REVIEW: "समीक्षाधीन", ASSIGNED: "सौंपा गया",
    IN_PROGRESS: "प्रगति में", RESOLVED: "सुलझाई गई", REJECTED: "अस्वीकृत",
  },
  severity: { LOW: "कम", MEDIUM: "मध्यम", HIGH: "उच्च", CRITICAL: "गंभीर" },
  notifications: {
    title: "सूचनाएं", subtitle: "आपकी नागरिक रिपोर्टों से जुड़े अपडेट।",
    none: "अभी तक कोई सूचना नहीं", markRead: "पढ़ा हुआ चिह्नित करें",
  },
  profile: {
    title: "प्रोफ़ाइल", subtitle: "अपने खाते का विवरण प्रबंधित करें।", fullName: "पूरा नाम",
    phone: "फ़ोन", email: "ईमेल", role: "भूमिका", saveChanges: "बदलाव सहेजें", saved: "प्रोफ़ाइल अपडेट हो गई।",
  },
  errors: { generic: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।", network: "सर्वर से संपर्क नहीं हो सका। अपना कनेक्शन जांचें और पुनः प्रयास करें।" },
};

export const dictionaries: Record<Language, Dict> = { en, hi };

export function translate(lang: Language, path: string): string {
  const segments = path.split(".");
  let node: unknown = dictionaries[lang];
  for (const segment of segments) {
    if (typeof node !== "object" || node === null) return path;
    node = (node as Record<string, unknown>)[segment];
  }
  if (typeof node === "string") return node;
  let fallback: unknown = dictionaries.en;
  for (const segment of segments) {
    if (typeof fallback !== "object" || fallback === null) return path;
    fallback = (fallback as Record<string, unknown>)[segment];
  }
  return typeof fallback === "string" ? fallback : path;
}
