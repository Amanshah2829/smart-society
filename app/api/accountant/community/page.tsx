

"use client"

import { Suspense } from "react"
import { redirect } from "next/navigation"

function CommunityRedirect() {
    redirect('/resident/community');
    return null;
}

export default function AccountantCommunityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityRedirect />
    </Suspense>
  )
}
