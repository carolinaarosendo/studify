
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '@/services/firebase';
import { formatarTexto, normalizarEmail } from '@/utils/formatarTexto';

type AuthContextData = {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (
    email: string,
    senha: string,
    nome: string,
    sobrenome: string
  ) => Promise<void>;
  atualizarNome: (nome: string, sobrenome: string) => Promise<void>;
  alterarSenha: (
    senhaAtual: string,
    novaSenha: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, senha: string) {
    await signInWithEmailAndPassword(
      auth,
      normalizarEmail(email),
      senha
    );
  }

  async function cadastro(
    email: string,
    senha: string,
    nome: string,
    sobrenome: string
  ) {
    const credencial = await createUserWithEmailAndPassword(
      auth,
      normalizarEmail(email),
      senha
    );

    const nomeCompleto = `${formatarTexto(nome)} ${formatarTexto(sobrenome)}`;

    await updateProfile(credencial.user, {
      displayName: nomeCompleto,
    });

    setUser(credencial.user);
  }

  async function atualizarNome(nome: string, sobrenome: string) {
    const usuario = auth.currentUser;

    if (!usuario) {
      throw new Error('Nenhum usuário autenticado.');
    }

    const nomeCompleto = `${formatarTexto(nome)} ${formatarTexto(sobrenome)}`;

    await updateProfile(usuario, {
      displayName: nomeCompleto,
    });

    setUser(
      Object.assign(
        Object.create(Object.getPrototypeOf(usuario)),
        usuario
      )
    );
  }

  async function alterarSenha(
    senhaAtual: string,
    novaSenha: string
  ) {
    const usuario = auth.currentUser;

    if (!usuario || !usuario.email) {
      throw new Error('Nenhum usuário autenticado.');
    }

    const credencial = EmailAuthProvider.credential(
      usuario.email,
      senhaAtual
    );

    await reauthenticateWithCredential(usuario, credencial);
    await updatePassword(usuario, novaSenha);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        cadastro,
        atualizarNome,
        alterarSenha,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }

  return context;
}
