import Axios from "@/api";
import {
  Organization,
  EditableOrganizationType,
} from "@/types/organization";
import { List } from "@/types/Request";

export async function getOrganizationList(params: {
  pageSize: number;
  current: number;
  name?: string;
  slug?: string;
}) {
  const res = await Axios.get<List<Organization>>("/internal/cms/organization/list", {
    params,
  });

  return res.data;
}

export async function getAllOrganizations(params: { search?: string }) {
  const res = await Axios.get<Organization[]>("/internal/cms/organization/all", {
    params,
  });

  return res.data;
}

export async function getOrganizationDetail(params: { id: string }) {
  const res = await Axios.get<Organization>(
    `/internal/cms/organization/detail/${params.id}`
  );

  return res.data;
}

export async function createOrganization(
  organization: EditableOrganizationType
) {
  const res = await Axios.post<Organization>(
    "/internal/cms/organization/create",
    {
      organization,
    }
  );

  return res.data;
}

export async function updateOrganization(
  organization: EditableOrganizationType
) {
  const res = await Axios.post<Organization>(
    "/internal/cms/organization/update",
    {
      organization,
    }
  );

  return res.data;
}

export async function deleteOrganization(id: string) {
  const res = await Axios.post<{ success: boolean }>(
    "/internal/cms/organization/delete",
    {
      id,
    }
  );

  return res.data;
}
