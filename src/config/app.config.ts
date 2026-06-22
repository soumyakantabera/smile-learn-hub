// Application configuration
export const appConfig = {
  appName: 'Learn with Smile',

  // Single support channel: WhatsApp only.
  support: {
    whatsappNumber: '919674479949', // +91 96744 79949
    label: '+91 96744 79949',
  },

  // Legacy submission targets — still used by the homework viewer prefill.
  submission: {
    whatsappNumber: '919674479949',
    email: 'submissions@learnwithsmile.edu',
  },

  // External viewer URLs for document preview
  viewers: {
    googleDocs: 'https://docs.google.com/viewer?url=',
    microsoftOffice: 'https://view.officeapps.live.com/op/view.aspx?src=',
  },
};

export type AppConfig = typeof appConfig;
