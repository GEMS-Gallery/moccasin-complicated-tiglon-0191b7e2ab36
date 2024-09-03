import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Certificate {
  'id' : bigint,
  'energySource' : string,
  'owner' : [] | [Principal],
  'createdAt' : Time,
  'imageUrl' : string,
  'details' : string,
  'price' : bigint,
}
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Time = bigint;
export interface _SERVICE {
  'addCertificate' : ActorMethod<[string, string, bigint, string], Result>,
  'getCertificates' : ActorMethod<[], Array<Certificate>>,
  'login' : ActorMethod<[], boolean>,
  'logout' : ActorMethod<[], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
