  

import { Context, storage, logging, env, u128, ContractPromise, PersistentVector, PersistentMap, ContractPromiseBatch } from "near-sdk-as"

import { 
  personaAccount,
  AppMetaData,
  AppIdentity,
  App,
  UserIdentity,
  Persona,
  personaMetaData,
  personasArray,
  Comment,
  comments,
  indivComments
 } from './persona-models'

// TApp Database Structures
// store app identities
let appIdentity = new PersistentMap<string, AppIdentity>("ai");
let apps = new PersistentVector<string>("a");
let appProfile = new PersistentMap<string, AppMetaData>("ad");

// store user identity
let userIdentity = new PersistentMap<string, UserIdentity>("ui");
let personas = new PersistentVector<string>("p");
let personaProfile = new PersistentMap<string, personaMetaData>("pm");

// ********************
// Textile App Setup
// ********************

// Create new Identity for App ThreadsDB
export function setAppData(app: App): void {
  let _appNumber = getAppData(app.appNumber);
  logging.log('setting app data')
  logging.log(_appNumber)
  if(_appNumber == null) {
    _appNumber = new Array<string>();
    _appNumber.push(app.appNumber); 
    _appNumber.push(app.appId);
    _appNumber.push(app.appCreatedDate);
    _appNumber.push(app.status);
    logging.log(_appNumber)
  } else {
    let present = false;
    let appNumberLength = _appNumber.length
    let i = 0
    while (i < appNumberLength) {
      if (_appNumber[0] == app.appNumber) {
        present = true;
        break;
      }
      i++
    }
    if (!present) {
      _appNumber.push(app.appNumber); 
      _appNumber.push(app.appId);
      _appNumber.push(app.appCreatedDate);
      _appNumber.push(app.status);
    }
  }
  let appData = new AppMetaData();
  appData.applog = _appNumber;
  appProfile.set(app.appNumber, appData);
  logging.log(appProfile);
  logging.log(app.appNumber);
  logging.log(appData);
}

function _addNewApp(appNumber: string): void {
  let present = false;
  let appLength = apps.length
  let i = 0
  while (i < appLength ) {
    if (apps[i] == appNumber) {
      present = true;
    }
    i++
  }
  if (!present) {
    apps.push(appNumber);
  }
}

export function getAppData(appNumber: string): Array<string> {
  let app = appProfile.get(appNumber);
  logging.log('getting app data')
  logging.log(app)
  if(!app) {
    return new Array<string>();
  }
  let appData = app.applog;
  return appData;
}

export function setAppIdentity(appId: string, identity: string, threadId: string, status: string): void {
  let present = false;
  logging.log('apps vector');
  logging.log(apps);
  let appsLength = apps.length
  let i = 0
  while (i < appsLength) {
    if (apps[i] == appId) {
      present = true;
      break;
    }
    i++
  }
    if (!present) {
      let thisAppNumber = appsLength + 1;
      let newAppIdentity = new AppIdentity();
      newAppIdentity.appId = appId;
      newAppIdentity.identity = identity;
      newAppIdentity.threadId = threadId;
      newAppIdentity.appNumber = thisAppNumber.toString();
      newAppIdentity.status = status;
      appIdentity.set(appId, newAppIdentity);
    } else {
      logging.log('app already has an identity set');
    }
}

export function getAppIdentity(appId: string): AppIdentity {
  let identity = appIdentity.getSome(appId);
  logging.log('getting app identity');
  logging.log(identity);
  return identity;
}

export function registerApp(
  appNumber: string,
  appId: string,
  appCreatedDate: string,
  status: string
  ): App {
  logging.log("registering app");
  return _registerApp(
    appNumber,
    appId,
    appCreatedDate,
    status
  );
  }
  
function _registerApp(
  appNumber: string,
  appId: string,
  appCreatedDate: string,
  status: string
): App {
  logging.log("start registering new app");
  let app = new App();
  app.appNumber = appNumber;
  app.appId = appId;
  app.appCreatedDate = appCreatedDate;
  app.status = status;
  setAppData(app);
  _addNewApp(appId);
  logging.log("registered new app");
  return app;
}

// Create new User Identities for ThreadsDB
  
export function setIdentity(account: string, identity: string, threadId: string, status: string): void {
  let present = false;
  logging.log('personas vector');
  logging.log(personas);
  let personasLength = personas.length
  let i = 0
  while (i < personasLength) {
    if (personas[i] == account) {
      present = true;
      break;
    }
    i++
  }
    if (!present) {
      let thisPersonaId = personasLength + 1;
      let newId = new UserIdentity();
      newId.account = account;
      newId.identity = identity;
      newId.threadId = threadId;
      newId.personaId = thisPersonaId.toString();
      newId.status = status;
      userIdentity.set(account, newId);
    } else {
      logging.log('persona already has an identity set');
    }
}

export function getIdentity(account: string): UserIdentity {
  let identity = userIdentity.getSome(account);
  logging.log('getting identity');
  logging.log(identity);
  return identity;
}

export function registerPersona(
  personaId: string,
  personaAccount: string,
  personaCreatedDate: string,
  personaStatus: string,
  personaPrivacy: string
  ): Persona {
  logging.log("registering persona");
  return _registerPersona(
    personaId,
    personaAccount,
    personaCreatedDate,
    personaStatus,
    personaPrivacy
  );
}

function _registerPersona(
  personaId: string,
  personaAccount: string,
  personaCreatedDate: string,
  personaStatus: string,
  personaPrivacy: string
): Persona {
  logging.log("start registering new persona");
  let persona = new Persona();
  persona.personaId = personaId;
  persona.personaAccount = personaAccount;
  persona.personaCreatedDate = personaCreatedDate;
  persona.personaStatus = personaStatus;
  persona.personaPrivacy = personaPrivacy;
  setPersonaData(persona);
  _addNewPersona(personaId);
  logging.log("registered new persona");
  return persona;
}

export function setPersonaData(persona: Persona): void {
  let _personaId = getPersonaData(persona.personaId);
  logging.log('setting persona data')
  logging.log(_personaId)
  if(_personaId == null) {
    _personaId = new Array<string>();
    _personaId.push(persona.personaId); 
    _personaId.push(persona.personaAccount);
    _personaId.push(persona.personaCreatedDate);
    _personaId.push(persona.personaStatus);
    _personaId.push(persona.personaPrivacy);
    logging.log(_personaId)
  } else {
    let present = false;
    let _personaIdLength = _personaId.length
    let i = 0
    while (i < _personaIdLength) {
      if (_personaId[0] == persona.personaId) {
        present = true;
        break;
      }
      i++
    }
    if (!present) {
    _personaId.push(persona.personaId);
    _personaId.push(persona.personaAccount);
    _personaId.push(persona.personaCreatedDate);
    _personaId.push(persona.personaStatus);
    _personaId.push(persona.personaPrivacy);
    }
  }
  let personaData = new personaMetaData();
  personaData.personalog = _personaId;
  personaProfile.set(persona.personaId, personaData);
  logging.log(personaProfile);
  logging.log(persona.personaId);
  logging.log(personaData);
}

function _addNewPersona(personaId: string): void {
  let present = false;
  let personasLength = personas.length
  let i = 0
  while (i < personasLength) {
    if (personas[i] == personaId) {
      present = true;
    }
    i++
  }
  if (!present) {
    personas.push(personaId);
  }
}

export function getPersonaData(personaId: string): Array<string> {
  let persona = personaProfile.get(personaId);
  logging.log('getting persona data')
  logging.log(persona)
  if(!persona) {
    return new Array<string>();
  }
  let personaData = persona.personalog;
  return personaData;
}

export function getAllPersonas(): personasArray {
  logging.log('retrieving personas');
  let _personaList = new Array<string[]>();
  logging.log(personas);
  for(let i: i32 = 0; i < personas.length; i++) {
    let _persona = getPersonaData(personas[i]);
    logging.log(_persona)
    _personaList.push(_persona);
  }
  let ml = new personasArray();
  ml.personas = _personaList;
  ml.len = _personaList.length;
  logging.log(ml)
  return ml;
}

// *********************
// COMMENT FUNCTIONALITY
// *********************

// Methods for Individual Comments
export function getComment(commentId: string): Comment {
  let comment = indivComments.getSome(commentId);
  return comment;
}

export function getCommentLength(): i32 {
  return comments.length
}

export function setComment(comment: Comment): void {
  indivComments.set(comment.commentId, comment);
}

export function addComment(
  commentId: string,
  commentParent: string,
  published: string
): Comment {
  logging.log("adding comment");
  return _addComment(
    commentId,
    commentParent,
    published
  );
}

function _addComment(
  commentId: string,
  commentParent: string,
  published: string
): Comment {
  logging.log("start adding new comment");
  let comment = new Comment();
  comment.commentId = commentId;
  comment.commentAuthor = Context.sender;
  comment.commentParent = commentParent;
  comment.published = published;
  let present = false;
  let commentsLength = comments.length
  let i = 0
  while(i < commentsLength) {
    if (comments[i].commentId == commentId) {
      present = true;
    }
    i++
  }
  if (!present) {
    comments.push(comment);
  }
  logging.log("added comment");
  setComment(comment)
  logging.log("added indiv comment")
  return comment;
}


export function deleteComment(commentId: string): void {
  indivComments.delete(commentId);
}

/**
 * returns all Comments
 */
export function getAllComments(): Array<Comment> {
  let _commentList = new Array<Comment>();
  let commentsLength = comments.length;
  let i = 0
  while (i < commentsLength) {
    _commentList.push(comments[i])
    i++
  }
  return _commentList;
}

/**
 * returns specific proposal Comments
 */
export function getProposalComments(proposalId: string): Array<Comment> {
  let _commentList = new Array<Comment>();
  let commentsLength = comments.length;
  let i = 0
  while (i < commentsLength) {
    if(comments[i].commentParent == proposalId){
    _commentList.push(comments[i])
    }
    i++
  }
  return _commentList;
}
  