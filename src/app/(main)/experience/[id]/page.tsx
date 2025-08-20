"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import experienceUpdateSchema, {
	ExperienceUpdateFormValues,
} from "@/components/forms/form-schemas/experience-update-schema";
import ExperienceForm from "@/components/forms/experience-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

type Experience = {
	_id: string;
	img: string;
	role: string;
	company: string;
	date: string;
	desc: string;
	skills?: string[];
};

const fetchExperience = async (id: string, userId: string) => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/experience/${userId}/${id}`,
		{ credentials: "include" }
	);
	if (!res.ok) throw new Error("Failed to fetch experience");
	return res.json() as Promise<Experience>;
};

export default function ExperienceDetailPage() {
	const params = useParams();
	const router = useRouter();
    const {data} = useSession();
    const userId = data?.user?.id;
	const queryClient = useQueryClient();
	const id = params?.id as string;

	const { data: experience, isLoading, isError } = useQuery({
		queryKey: ["experience", id],
		queryFn: () => fetchExperience(id, userId),
		enabled: !!id,
	});

	const form = useForm<ExperienceUpdateFormValues>({
		resolver: zodResolver(experienceUpdateSchema),
		defaultValues: {
			desc: "",
			company: "",
			role: "",
			date: "",
			img: undefined,
		},
		values: experience
			? {
					desc: experience.desc || "",
					company: experience.company || "",
					role: experience.role || "",
					date: experience.date || "",
					img: undefined,
				}
			: undefined,
	});

		const mutation = useMutation<{ success?: boolean; message?: string }, Error, ExperienceUpdateFormValues>({
			mutationFn: async (values: ExperienceUpdateFormValues) => {
			const formData = new FormData();
			formData.append("desc", values.desc);
			formData.append("company", values.company);
			formData.append("role", values.role);
			formData.append("date", values.date);
			if (values.img?.[0]) formData.append("img", values.img[0]);
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/experience/${id}`,
				{ method: "PUT", body: formData, credentials: "include" }
			);
			if (!res.ok) throw new Error("Failed to update experience");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["experiences"] });
			queryClient.invalidateQueries({ queryKey: ["experience", id] });
			alert("Experience updated successfully");
			router.push("/experience");
		},
			onError: (err) => {
				console.error(err);
				alert(err.message || "Update failed");
		},
	});

	const handleSubmit = (values: ExperienceUpdateFormValues) => {
		mutation.mutate(values);
	};

	if (isLoading) return <p className="p-6">Loading...</p>;
	if (isError || !experience) return <p className="p-6">Failed to load experience.</p>;

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Edit Experience</CardTitle>
				<CardDescription>View and update this experience entry</CardDescription>
			</CardHeader>
			<CardContent>
										<ExperienceForm
											form={form}
											handleSubmit={handleSubmit}
											initialPreview={experience.img}
											submitLabel={mutation.isPending ? "Saving..." : "Save Changes"}
											resetLabel="Reset"
										/>
			</CardContent>
			<CardFooter className="flex justify-end gap-2">
				<Button variant="outline" onClick={() => router.push("/experience")}>Cancel</Button>
				<Button
					onClick={form.handleSubmit(handleSubmit)}
					disabled={mutation.isPending}
				>
					{mutation.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</CardFooter>
		</Card>
	);
}
