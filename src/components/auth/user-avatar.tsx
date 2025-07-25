
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"

export function UserAvatar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Avatar>
      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
      <AvatarFallback>
        {user.displayName?.[0] || user.email?.[0]}
      </AvatarFallback>
    </Avatar>
  )
}
