import React from "react";
import Lottie from "lottie-react";
import Empty1 from "./empty.json";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function Empty() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-4 justify-center">
      <Lottie
        animationData={Empty1}
        loop={true}
        className="h-full w-full max-w-2xl"
      />
      <Button className="w-28" variant={"primary"} onClick={() => navigate(-1)}>
        Back
      </Button>
    </div>
  );
}

export default Empty;
