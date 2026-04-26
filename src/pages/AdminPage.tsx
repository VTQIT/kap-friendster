import { trpc } from "@/providers/trpc";
import RetroLayout from "@/components/RetroLayout";

export default function AdminPage() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.users.useQuery();
  const updateRole = trpc.admin.updateRole.useMutation({
    onSuccess: () => utils.admin.users.invalidate(),
  });

  return (
    <RetroLayout>
      <div className="retro-card">
        <div className="font-bold mb-3 glitter-text">Admin Panel</div>
        {isLoading && <div className="text-sm">Loading...</div>}
        <table className="retro-table text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    onClick={() =>
                      updateRole.mutate({ userId: u.id, role: u.role === "admin" ? "user" : "admin" })
                    }
                    className="retro-btn text-xs"
                  >
                    Toggle Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RetroLayout>
  );
}
