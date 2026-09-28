import { create } from 'zustand'
import type { User } from '@/lib/types'
import { buildSeed } from '@/data/seed'
const fallback: User = { id:'u-001',name:'Aditi Kulkarni',designation:'Sub-Inspector',role:'investigator',badgeId:'MH-POL-2291',station:'Cyber Police Station, Pune',department:'Maharashtra Police',clearance:'restricted',initials:'AK',email:'aditi.kulkarni@police.gov.in' }
const storedTheme = typeof window === 'undefined' ? 'light' : localStorage.getItem('esakshya-theme')
const initialTheme: 'light' | 'dark' = storedTheme === 'dark' ? 'dark' : 'light'
if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', initialTheme === 'dark')
export const useSession = create<{user:User;users:User[];setUserId:(id:string)=>void;theme:'light'|'dark';toggleTheme:()=>void;authenticated:boolean;signIn:(user:User)=>void;signOut:()=>void}>((set,get)=>({
  user:fallback, users:[fallback], theme:initialTheme, authenticated:typeof window !== 'undefined' && localStorage.getItem('esakshya-auth') === 'true',
  setUserId:(id)=>{const user=get().users.find((entry)=>entry.id===id);if(user)set({user})},
  toggleTheme:()=>set((state)=>{const theme=state.theme==='light'?'dark':'light'; document.documentElement.classList.toggle('dark',theme==='dark');localStorage.setItem('esakshya-theme',theme);return {theme}}),
  signIn:(user)=>{localStorage.setItem('esakshya-auth','true');set({user,authenticated:true})}, signOut:()=>{localStorage.removeItem('esakshya-auth');set({authenticated:false})},
}))
void buildSeed().then(({users})=>useSession.setState((state)=>({users,user:users.find((user)=>user.id===state.user.id) ?? users[0]})))
