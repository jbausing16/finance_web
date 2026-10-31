import React, { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { AppSidebar } from "../../reusables/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/reusables/CustomDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import Header from "@/components/reusables/Header";
import { formatDateM, formatMoney, hasAccess } from "@/lib/utils";
import { AccountList } from "@/components/reusables/RawDatas";
import {
  useAddAccountMutation,
  useGetAccountsQuery,
  useGetAccTypesQuery,
  useUpAccountMutation,
} from "@/store/api/AdministrationApi";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";

export type wtax = {
  id: number;
  code: string;
  name: string;
  tax_amt: number;
  wtax_amt: number;
};

export type accTypes = {
  id: number;
  name: string;
};

export type account = {
  id: number;
  account: string;
  code: string;
  parent: number;
  acc_type: number;
  type: number;
  level: number;
  amount: number;
  status: number;
  cash: boolean;
  wtax: boolean;
};

function ChartOfAccounts() {
  const [search, setSearch] = useState("");
  const [openAddParent, setOpenAddParent] = useState(false);
  const [selected, setSelected] = useState("---");
  const [type, setType] = useState(1);
  const [aType, setAType] = useState(1);

  const [activeAcc, setActiveAcc] = useState(1);

  const [accTypes, setAccTypes] = useState<accTypes[]>([]);
  const [accounts, setAccounts] = useState<account[]>([]);

  const [addAcc, setAddAcc] = useState({
    category: 0,
    code: "",
    name: "",
    cash: 0,
    wtax: 0,
    parent: 1,
    type: 0,
    level: 1,
  });

  const [editAcc, setEditAcc] = useState({
    id: 0,
    category: 0,
    code: "",
    name: "",
    cash: 0,
    wtax: 0,
    parent: 1,
    type: 0,
    level: 1,
    status: 1,
    balance: 0,
  });

  const getAccTypes = useGetAccTypesQuery({});
  useEffect(() => {
    if ((getAccTypes.isSuccess, getAccTypes.data)) {
      setAccTypes(getAccTypes.data.data);
    }
  }, [getAccTypes.isSuccess, getAccTypes.data]);

  const getAccounts = useGetAccountsQuery(activeAcc);
  useEffect(() => {
    if ((getAccounts.isSuccess, getAccounts.data)) {
      setAccounts(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  const [addAccount] = useAddAccountMutation();
  const [upAccount] = useUpAccountMutation();
  const submitAddAccount = async () => {
    if (type === 1) {
      console.log("Account here: ", addAcc);
      if (addAcc.name !== "") {
        try {
          const formData = new FormData();
          formData.append("datas", JSON.stringify(addAcc));

          const checkstat = await addAccount(formData).unwrap();

          if (checkstat.success) {
            // setMessage("");
            setOpenAddParent(false);
          }

          console.log(checkstat);
        } catch (error) {}
      } else {
        toast.error("Please input Account Name!");
      }
    } else {
      if (editAcc.name !== "") {
        try {
          const formData = new FormData();
          formData.append("datas", JSON.stringify(editAcc));

          const checkstat = await upAccount(formData).unwrap();

          if (checkstat.success) {
            // setMessage("");
            setOpenAddParent(false);
          }

          console.log(checkstat);
        } catch (error) {}
      } else {
        toast.error("Please input Account Name!");
      }
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;

    if (type === 1) {
      setAddAcc((prevState) => {
        if (id === "cash") {
          return {
            ...prevState,
            cash: checked ? 1 : 0,
            wtax: !checked ? prevState.wtax : 0,
          };
        } else if (id === "wtax") {
          return {
            ...prevState,
            wtax: checked ? 1 : 0,
            cash: !checked ? prevState.cash : 0,
          };
        }
        return prevState;
      });
    } else {
      setEditAcc((prevState) => {
        if (id === "cash") {
          return {
            ...prevState,
            cash: checked ? 1 : 0,
            wtax: !checked ? prevState.wtax : 0,
          };
        } else if (id === "wtax") {
          return {
            ...prevState,
            wtax: checked ? 1 : 0,
            cash: !checked ? prevState.cash : 0,
          };
        }
        return prevState;
      });
    }
  };

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Chart of Accounts" />
          {!hasAccess(access, "15", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 px-10">
              <div
                className="flex justify-between
            "
              >
                <div className="flex gap-2"></div>

                {hasAccess(access, "15", "create") && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setAType(1);
                        setType(1);
                        setOpenAddParent(true);
                        setAddAcc({
                          ...addAcc,
                          category: activeAcc,
                          code: "",
                          name: "",
                          cash: 0,
                          wtax: 0,
                          parent: 1,
                          level: 1,
                          type: 1,
                        });
                        setSelected("---");
                      }}
                    >
                      Add Parent Account
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setAType(2);
                        setType(1);
                        setOpenAddParent(true);
                        setTimeout(() => {
                          setAddAcc({
                            ...addAcc,
                            category: activeAcc,
                            code: "",
                            name: "",
                            cash: 0,
                            wtax: 0,
                            parent: 1,
                            level: 1,
                            type: 2,
                          });
                        }, 100);

                        setSelected("---");
                      }}
                    >
                      Add Child Account
                    </Button>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key="view1"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col border"
                >
                  {/* <div className="flex flex-col border"> */}
                  <div className="flex h-[80vh]">
                    <div className="h-full border">
                      {accTypes.map((item) => (
                        <div
                          key={item.id}
                          className={`flex p-2 w-36 h-16 items-center border cursor-pointer ${
                            activeAcc === item.id
                              ? `bg-blue-700 text-white`
                              : ``
                          }`}
                          onClick={() => {
                            setActiveAcc(item.id);
                            setAddAcc({ ...addAcc, category: item.id });
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col p-4 h-[75vh] overflow-auto my-4 w-full select-text">
                      {getAccounts.isLoading ? (
                        <Skeleton className="h-96 w-full " />
                      ) : (
                        <>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeAcc} // triggers re-animation when activeAcc changes
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.3 }}
                              className=""
                            >
                              {accounts.map((item, index) => (
                                <>
                                  <div
                                    key={index}
                                    className={`flex justify-between cursor-pointer ${
                                      item.type === 2 ? `border-b` : ``
                                    } ${item.status === 2 ? `text-red-600` : ``}`}
                                    onClick={() => {
                                      setType(2);
                                      setOpenAddParent(true);
                                      console.log("Account here:", item);
                                      setEditAcc({
                                        id: item.id,
                                        category: item.acc_type,
                                        code: item.code,
                                        name: item.account,
                                        cash: item.cash === true ? 1 : 0,
                                        wtax: item.wtax === true ? 1 : 0,
                                        parent: item.parent,
                                        type: item.type,
                                        level: item.level,
                                        status: item.status,
                                        balance: item.amount,
                                      });
                                      setAType(item.type);

                                      const acct = accounts.find(
                                        (item1) => item1.id === item.parent,
                                      );
                                      setSelected(acct?.account ?? "");
                                    }}
                                  >
                                    <span
                                      className={` ${
                                        item.type === 1 ? `font-bold` : ``
                                      } ${
                                        item.level === 3
                                          ? `pl-10`
                                          : item.level === 4
                                            ? `pl-20`
                                            : item.level === 5
                                              ? `pl-30`
                                              : item.level === 6
                                                ? `pl-40`
                                                : ``
                                      }`}
                                    >
                                      {item.account}{" "}
                                      {item.type === 2 && (
                                        <span
                                          className={`text-gray-700 text-sm ${
                                            item.status === 2
                                              ? `text-red-600`
                                              : ``
                                          }`}
                                        >
                                          {" "}
                                          - ({item.code})
                                        </span>
                                      )}
                                    </span>
                                    <span
                                      className={`pr-0 md:pr-10 ${
                                        item.status === 2 ? `text-red-600` : ``
                                      }`}
                                    >
                                      {item.type === 2
                                        ? formatMoney(item.amount)
                                        : ``}
                                    </span>
                                  </div>
                                </>
                              ))}
                            </motion.div>
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {openAddParent && (
        <CustomDialog
          close={setOpenAddParent}
          title={``}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 gap-1 py-2 z-50">
            <div className="flex flex-col gap-3">
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Choose Section</Label>
                <Select
                  value={
                    type === 1 ? String(addAcc.parent) : String(editAcc.parent)
                  }
                  onValueChange={(e) => {
                    const acct = accounts.find(
                      (item) => item.id === parseInt(e),
                    );

                    const count = accounts.filter(
                      (item) => item.parent === acct?.id,
                    ).length;

                    let count1 =
                      count > 9 ? String(count + 1) : "0" + String(count + 1);

                    let newcode =
                      acct?.code.slice(0, acct?.level * 2) +
                      count1 +
                      acct?.code.slice(acct?.level * 2 + 2);

                    if (e === "---") {
                      setSelected("---");
                      if (type === 1) {
                        setAddAcc({
                          ...addAcc,
                          parent: 1,
                          code: newcode,
                          level: (acct?.level || 1) + 1,
                        });
                      } else {
                        setEditAcc({
                          ...editAcc,
                          parent: 1,
                          code: newcode,
                          level: (acct?.level || 1) + 1,
                        });
                      }
                    } else {
                      setSelected(acct?.account ?? "");
                      if (type === 1) {
                        setAddAcc({
                          ...addAcc,
                          parent: parseInt(e),
                          code: newcode,
                          level: (acct?.level || 1) + 1,
                        });
                      } else {
                        setEditAcc({
                          ...editAcc,
                          parent: parseInt(e),
                          code: newcode,
                          level: (acct?.level || 1) + 1,
                        });
                      }
                    }
                  }}
                  disabled={!hasAccess(access, "15", "edit")}
                >
                  <SelectTrigger className="w-full">
                    {/* <SelectValue placeholder="---" /> */}
                    {selected}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="---" select-item={true}>
                      ---
                    </SelectItem>
                    {accounts
                      .filter((item) => item.type === 1)
                      .map((item) => (
                        <SelectItem
                          value={String(item.id)}
                          disabled={type === 2 && editAcc.id === item.id}
                        >
                          <span
                            className={`${
                              item.level === 3
                                ? `pl-10`
                                : item.level === 4
                                  ? `pl-20`
                                  : item.level === 5
                                    ? `pl-30`
                                    : ``
                            }`}
                          >
                            {item.account}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Account Code</Label>
                <Input
                  type="text"
                  placeholder="Account Code"
                  className={`w-full bg-gray-50`}
                  value={type === 1 ? addAcc.code : editAcc.code}
                  onChange={(e) => {
                    if (type === 1) {
                      setAddAcc({
                        ...addAcc,
                        code: e.target.value,
                      });
                    } else {
                      setEditAcc({
                        ...editAcc,
                        code: e.target.value,
                      });
                    }
                  }}
                  readOnly={!hasAccess(access, "15", "edit")}
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Account Name</Label>
                <Input
                  type="text"
                  placeholder="Account Name"
                  className={`w-full bg-gray-50`}
                  value={type === 1 ? addAcc.name : editAcc.name}
                  onChange={(e) => {
                    if (type === 1) {
                      setAddAcc({
                        ...addAcc,
                        name: e.target.value,
                      });
                    } else {
                      setEditAcc({
                        ...editAcc,
                        name: e.target.value,
                      });
                    }
                  }}
                  readOnly={!hasAccess(access, "15", "edit")}
                />
              </div>

              {type === 2 && (
                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Status</Label>
                  <Select
                    value={String(editAcc.status)}
                    onValueChange={(e) => {
                      const status = e === "1" ? 1 : 2;
                      setEditAcc({
                        ...editAcc,
                        status: status,
                      });
                    }}
                    disabled={!hasAccess(access, "15", "edit")}
                  >
                    <SelectTrigger className="w-full">
                      {editAcc.status === 1 ? "Active" : "Inactive"}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" select-item={editAcc.status === 1}>
                        Active
                      </SelectItem>
                      <SelectItem
                        value="2"
                        select-item={editAcc.status === 1}
                        disabled={
                          aType === 2
                            ? String(editAcc.balance) !== "0"
                            : accounts
                                .filter((item) => item.parent === editAcc.id)
                                .reduce((sum, row) => {
                                  const amount =
                                    typeof row.amount === "string"
                                      ? parseFloat(row.amount)
                                      : row.amount;
                                  return sum + (isNaN(amount) ? 0 : amount);
                                }, 0) !== 0
                        }
                      >
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between w-full">
              <div className="flex items-center gap-6">
                {aType === 2 && (
                  <>
                    {activeAcc === 1 && (
                      <div className="flex items-center gap-2">
                        {type === 1 ? (
                          <input
                            type="checkbox"
                            id="cash"
                            checked={addAcc.cash === 1}
                            onChange={handleCheckboxChange}
                            disabled={!hasAccess(access, "15", "edit")}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            id="cash"
                            checked={editAcc.cash === 1}
                            onChange={handleCheckboxChange}
                            disabled={!hasAccess(access, "15", "edit")}
                          />
                        )}
                        <label htmlFor="cash">Cash</label>
                      </div>
                    )}
                    {activeAcc === 2 && (
                      <div className="flex items-center gap-2">
                        {type === 1 ? (
                          <input
                            type="checkbox"
                            id="wtax"
                            checked={addAcc.wtax === 1}
                            onChange={handleCheckboxChange}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            id="wtax"
                            checked={editAcc.wtax === 1}
                            onChange={handleCheckboxChange}
                          />
                        )}
                        <label htmlFor="wtax">Wtax</label>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                {type === 1 ? (
                  <Button
                    size={"sm"}
                    variant={"primary"}
                    onClick={submitAddAccount}
                  >
                    Add
                    {aType === 1 ? ` Parent` : ` Child`} Account
                  </Button>
                ) : (
                  hasAccess(access, "15", "edit") && (
                    <Button
                      size={"sm"}
                      variant={"primary"}
                      onClick={submitAddAccount}
                    >
                      Update
                      {aType === 1 ? `Parent` : `Child`} Account
                    </Button>
                  )
                )}

                {/* {hasAccess(access, "15", "edit") && (
                  <Button
                    size={"sm"}
                    variant={"primary"}
                    onClick={submitAddAccount}
                  >
                    {type === 1 ? `Add` : `Update`}{" "}
                    {aType === 1 ? `Parent` : `Child`} Account
                  </Button>
                )} */}
              </div>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default ChartOfAccounts;
