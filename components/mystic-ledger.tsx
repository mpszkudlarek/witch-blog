"use client"

import React, {useState} from "react"
import {useRouter} from "next/navigation"
import AdminPasswordGate from "./admin-password-gate"
import LedgerView from "./ledger-view"

export default function MysticLedger() {
    useRouter();
    const [adminPassword, setAdminPassword] = useState<string | null>(null)

    return (
        <>
            {!adminPassword ? (
                <AdminPasswordGate onAuthenticatedAction={setAdminPassword}/>
            ) : (
                <LedgerView password={adminPassword} onExitAction={() => setAdminPassword(null)}/>
            )}
        </>
    )
}
