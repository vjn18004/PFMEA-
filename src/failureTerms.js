const terms={
 main:{singular:'Feleffekt',plural:'Feleffekter',lower:'feleffekt',description:'Hur påverkas huvudprocessens resultat när funktionen inte uppnås?'},
 property:{singular:'Felsätt',plural:'Felsätt',lower:'felsätt',description:'På vilket sätt kan operationen misslyckas med att uppnå produktegenskapen?'},
 resource:{singular:'Felorsak',plural:'Felorsaker',lower:'felorsak',description:'Hur kan denna 4M-resurs bidra till att operationens funktion inte uppnås?'}
};
export function failureTerms(kind){return terms[kind]||terms.property;}
