import React, { useState } from "react";
import CustomDialog from "./CustomDialog";
import { Button } from "../ui/button";

interface YesNoProps {
  title: React.ReactNode;
  message?: string;
  funct: () => void;
  dis?: boolean;
}

function YesNo({ title, message, funct, dis }: YesNoProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // <- prevent context menu from reopening
    if (dis) {
    } else {
      setOpen(true);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <span onClick={handleClickOpen}> {title}</span>

      {open && (
        <div onClick={(e) => e.stopPropagation()}>
          <CustomDialog
            close={() => setOpen(false)}
            title=""
            width="!max-w-[50vw]"
            height=""
            closeIcon="N"
            button=""
            escape="N"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex  flex-col gap-4"
            >
              <span className="font-medium text-lg">{message}</span>
              <div className="w-full flex pb-0">
                <div className="w-1/2 text-center">
                  <Button
                    className="w-5/6"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose(e);
                      funct();
                    }}
                  >
                    Yes
                  </Button>
                </div>

                <div className="w-1/2 text-center">
                  <Button
                    className="w-5/6"
                    variant="second"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose(e);
                    }}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </CustomDialog>
        </div>
      )}
    </>
  );
}

export default YesNo;
