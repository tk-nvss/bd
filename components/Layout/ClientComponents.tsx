"use client";

import dynamic from "next/dynamic";

const SocialFloat = dynamic(() => import("../SocialFloat/SocialFloat"), { ssr: false });
const Maintenance = dynamic(() => import("../Maintenance/Maintenance"), { ssr: false });

export default function ClientComponents() {
    return (
        <>
            <SocialFloat />
            <Maintenance />
        </>
    );
}
