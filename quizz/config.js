export const config = { masterclassUrl: '', title: 'A Coragem de se Escolher' };

export function enrollmentUrl(value=config.masterclassUrl){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
