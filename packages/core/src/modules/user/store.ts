import { User, UserState } from '../../types/user'

let store: UserState = {
  user: null,
  loading: false
}

export const getStore = () => store

export const setUser = (newUser: User) => {
  store.user = newUser
}

export const setLoading = (loading: boolean) => {
  store.loading = loading
}

export const useStore = () => ({
  getUser: () => store.user,
  isLoading: () => store.loading,
  setUser,
  setLoading
})