import React, { useEffect, useState } from "react";
import CustomDialog from "./CustomDialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import {
  useGetBarangayQuery,
  useGetCityQuery,
  useGetProvinceQuery,
  useGetRegionQuery,
} from "@/store/api/AdministrationApi";

interface Address {
  regionId: number;
  provinceId: number;
  cityId: number;
  barangayId: number;
  barangayName: string;
}

interface Props {
  value: Address;
  onChange: (val: Address) => void;
}

function Barangay({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const [openR, setOpenR] = useState(false);
  const [openP, setOpenP] = useState(false);
  const [openC, setOpenC] = useState(false);
  const [openB, setOpenB] = useState(false);

  const [regionId, setRegionId] = useState<number>(0);
  const [provinceId, setProvinceId] = useState<number>(0);
  const [cityId, setCityId] = useState<number>(0);
  const [barangayId, setBarangayId] = useState<number>(0);
  const [barangayName, setBarangayName] = useState("");

  const [region, setRegion] = useState<Address[]>([]);
  const [province, setProvince] = useState<Address[]>([]);
  const [city, setCity] = useState<Address[]>([]);
  const [barangay, setBarangay] = useState<Address[]>([]);

  const getRegion = useGetRegionQuery({});

  const getProvince = useGetProvinceQuery(value.regionId, {
    skip: value.regionId === 0,
  });
  const getCity = useGetCityQuery(value.provinceId, {
    skip: value.provinceId === 0,
  });
  const getBarangay = useGetBarangayQuery(value.cityId, {
    skip: value.cityId === 0,
  });

  useEffect(() => {
    if (getRegion.isSuccess && getRegion.data) {
      setRegion(getRegion.data.data);
    }
  }, [getRegion.isSuccess, getRegion.data]);
  useEffect(() => {
    if (getProvince.isSuccess && getProvince.data) {
      setProvince(getProvince.data.data);
    }
  }, [getProvince.isSuccess, getProvince.data]);
  useEffect(() => {
    if (getCity.isSuccess && getCity.data) {
      setCity(getCity.data.data);
    }
  }, [getCity.isSuccess, getCity.data]);
  useEffect(() => {
    if (getBarangay.isSuccess && getBarangay.data) {
      setBarangay(getBarangay.data.data);
    }
  }, [getBarangay.isSuccess, getBarangay.data]);

  useEffect(() => {
    if (value.barangayId !== 0 && getBarangay.data?.data) {
      const selected = getBarangay.data.data.find(
        (b: any) => b.id === value.barangayId
      );
      if (selected) {
        onChange({ ...value, barangayName: selected.name });
      }
    }
  }, [getBarangay.data, value.barangayId]);

  const setValue = (partial: Partial<Address>) =>
    onChange({ ...value, ...partial });

  return (
    <>
      {/* <Input
        type="text"
        className={`w-full bg-gray-50`}
        onClick={() => setOpen(true)}
        value={
          bid === 0
            ? "Select Barangay"
            : barangay.find((item) => item.id === bid)?.name
        }
        readOnly
      /> */}
      {/* {bid} */}

      <Input
        readOnly
        onClick={() => setOpen(true)}
        value={value.barangayId === 0 ? "Select Barangay" : value.barangayName}
        className="w-full bg-gray-50"
      />

      {open && (
        <CustomDialog
          close={setOpen}
          title={``}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 py-2 gap-4">
            <ComboBox
              label="Region"
              openKey="region"
              valueId={value.regionId}
              list={region || []}
              onSelect={(id: number, name: string) =>
                setValue({
                  regionId: id,
                  provinceId: 0,
                  cityId: 0,
                  barangayId: 0,
                  barangayName: "",
                })
              }
            />

            <ComboBox
              label="Province"
              openKey="province"
              valueId={value.provinceId}
              list={province || []}
              disabled={value.regionId === 0}
              onSelect={(id: number) =>
                setValue({
                  provinceId: id,
                  cityId: 0,
                  barangayId: 0,
                  barangayName: "",
                })
              }
            />

            <ComboBox
              label="Municipality"
              openKey="city"
              valueId={value.cityId}
              list={city || []}
              disabled={value.provinceId === 0}
              onSelect={(id: number) =>
                setValue({
                  cityId: id,
                  barangayId: 0,
                  barangayName: "",
                })
              }
            />

            <ComboBox
              label="Barangay"
              openKey="barangay"
              valueId={value.barangayId}
              list={barangay || []}
              disabled={value.cityId === 0}
              onSelect={(id: number, name: string) =>
                setValue({
                  barangayId: id,
                  barangayName: name,
                })
              }
            />

            <Button
              className="w-full"
              variant="primary"
              onClick={() => setOpen(false)}
            >
              Select
            </Button>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default Barangay;

function ComboBox({ label, list, valueId, onSelect, disabled = false }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-1">
      <label className="font-semibold">{label}</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-between"
          >
            {valueId
              ? list.find((i: any) => i.id === valueId)?.name
              : `Select ${label.toLowerCase()}...`}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>

              <CommandGroup>
                {list.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onSelect(item.id, item.name);
                      setOpen(false);
                    }}
                  >
                    {item.name}
                    {valueId === item.id && <Check className="ml-auto" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
