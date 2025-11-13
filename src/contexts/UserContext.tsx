// src/context/UserContext.tsx
import React, { createContext, useContext, useState } from 'react'

type UserCtx = {
  nim?: string
  setNim: (v?: string) => void
}

const UserContext = createContext<UserCtx>({
  nim: undefined,
  setNim: () => {},
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nim, setNim] = useState<string | undefined>(undefined)

  return (
    <UserContext.Provider value={{ nim, setNim }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
