import Axios from "@/api";
import { EventType } from "@/types/event";
import {
  OrganizationType,
  EditableOrganizationType,
} from "@/types/organization";
import { List } from "@/types/Request";

export async function getOrganizationList(params: {
  pageSize: number;
  current: number;
}) {
  const res = await Axios.get<List<OrganizationType>>("/organization/list", {
    params,
  });

  return res.data;
}

export async function getAllOrganizations(params: { search?: string }) {
  const res = await Axios.get<OrganizationType[]>("/organization/all", {
    params,
  });

  return res.data;
}

export async function getOrganizationDetail(params: { id: string }) {
  const res = await Axios.get<OrganizationType>(`/organization/detail/${params.id}`);

  return res.data;
}

export async function createOrganization(
  organization: EditableOrganizationType
) {
  const res = await Axios.post<OrganizationType>("/organization/create", {
    organization,
  });

  return res.data;
}

export async function updateOrganization(
  organization: EditableOrganizationType
) {
  const res = await Axios.post<OrganizationType>("/organization/update", {
    organization,
  });

  return res.data;
}
