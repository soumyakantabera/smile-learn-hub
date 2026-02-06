// Application configuration
// These values can be customized for your deployment

export const appConfig = {
  // App name displayed in header and titles
  appName: "Learn with Smile",
  
  // Contact information for homework submissions
  submission: {
    // WhatsApp phone number with country code (no + sign)
    // Change this to your institution's WhatsApp number
    whatsappNumber: "1234567890",
    
    // Email address for submissions
    // Change this to your institution's email
    email: "submissions@learnwithsmile.edu",
  },
  
  // Session configuration
  session: {
    // How long a login session lasts (in hours)
    expiryHours: 8,
    
    // Storage key for session data
    storageKey: "lws_session",
  },
  
  // External viewer URLs for document preview
  viewers: {
    googleDocs: "https://docs.google.com/viewer?url=",
    microsoftOffice: "https://view.officeapps.live.com/op/view.aspx?src=",
  },
};

export type AppConfig = typeof appConfig;
