import { PersistentMap, PersistentVector } from 'near-sdk-as'

// Data Types and Storage

export const personaAccount = new PersistentMap<string, Persona>('pa') // maps account to its Persona model

// store all unique comments
export const comments = new PersistentVector<Comment>("c");

// store all comments of a particular author
export const indivComments = new PersistentMap<string, Comment>("ic");

// App Textile Database Models

@nearBindgen
export class AppIdentity {
    appId: string;
    identity: string; //PrivateKey string of key
    threadId: string;
    appNumber: string;
    status: string;
}

// App Definitions
@nearBindgen
export class App {
    appNumber: string; //App ID
    appId: string; // App Title
    appCreatedDate: string;
    status: string;
}

@nearBindgen
export class AppsArray {
    apps: Array<string[]>;
    len: i32;
}

@nearBindgen
export class AppMetaData {
    applog: Array<string>;
}

// User Identities
@nearBindgen
export class UserIdentity {
    account: string;
    identity: string; //PrivateKey string of key
    threadId: string;
    personaId: string;
    status: string;
}

// Persona Definitions
@nearBindgen
export class Persona {
    personaId: string;
    personaAccount: string;
    personaCreatedDate: string;
    personaStatus: string;
    personaPrivacy: string;
}

@nearBindgen
export class personasArray {
    personas: Array<string[]>;
    len: i32;
}

@nearBindgen
export class personaMetaData {
    personalog: Array<string>;
}

// Profiles Models
@nearBindgen
export class Profile {
    member: string;
    profileId: string;
    profileVerificationHash: string;
    privacy: string;
}

@nearBindgen
export class ProfileMetaData {
    profileData: Array<string>;
    len: i32;
}

@nearBindgen
export class ProfileArray {
    profiles: Array<string[]>;
    len: i32;
}

// Comments Models
@nearBindgen
export class Comment {
    commentAuthor: string;
    commentId: string;
    commentParent: string;
    published: string;
}