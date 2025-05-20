"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { saveRecentProfile, triggerRecentProfilesUpdate } from "@/hooks/useRecentProfiles";

const ProfilePage = () => {
  const params = useParams();
  useEffect(() => {
    if (params?.region && params?.name && params?.tagline) {
      saveRecentProfile({
        region: params.region as string,
        name: params.name as string,
        tagline: params.tagline as string,
      });
      triggerRecentProfilesUpdate();
    }
  }, [params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Perfil</h1>
      <p className="text-gray-400">Aquí irá la información del perfil.</p>
    </div>
  );
};

export default ProfilePage;
