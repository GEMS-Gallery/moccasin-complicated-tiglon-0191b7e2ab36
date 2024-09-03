export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Time = IDL.Int;
  const Certificate = IDL.Record({
    'id' : IDL.Nat,
    'energySource' : IDL.Text,
    'owner' : IDL.Opt(IDL.Principal),
    'createdAt' : Time,
    'imageUrl' : IDL.Text,
    'details' : IDL.Text,
    'price' : IDL.Nat,
  });
  return IDL.Service({
    'addCertificate' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Text],
        [Result],
        [],
      ),
    'getCertificates' : IDL.Func([], [IDL.Vec(Certificate)], ['query']),
    'login' : IDL.Func([], [IDL.Bool], []),
    'logout' : IDL.Func([], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
