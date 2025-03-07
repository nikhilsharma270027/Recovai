"use client"
import React, { useState } from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    
      <div className="bg-slate-100 h-screen w-full">
        {children}
      </div>
      
  );
};

export default layout;