import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createPool } from "./db.mjs";

const [command = "list", ...args] = process.argv.slice(2);
const pool = createPool();

function usage() {
  console.log("Usage: guestbook.mjs list | export [path] | delete <uuid> [--confirm <uuid>] | cleanup");
}

try {
  if (command === "list") {
    const result = await pool.query("SELECT id, guest_name, attendance, guest_count, message, side, created_at FROM guestbook_entries ORDER BY created_at DESC, id DESC");
    console.table(result.rows);
  } else if (command === "export") {
    const result = await pool.query("SELECT id, guest_name, attendance, guest_count, message, side, created_at FROM guestbook_entries ORDER BY created_at DESC, id DESC");
    const output = args[0] || join("exports", `guestbook-${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}.json`);
    await mkdir(join(process.cwd(), "exports"), { recursive: true });
    await writeFile(output, `${JSON.stringify(result.rows, null, 2)}\n`, "utf8");
    console.log(`Exported ${result.rowCount} entries to ${output}`);
  } else if (command === "delete") {
    const id = args[0];
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Provide an exact guestbook UUID.");
    const selected = await pool.query("SELECT id, guest_name, attendance, guest_count, message, side, created_at FROM guestbook_entries WHERE id = $1", [id]);
    if (!selected.rowCount) throw new Error("Entry not found.");
    const confirmationIndex = args.indexOf("--confirm");
    if (confirmationIndex < 0 || args[confirmationIndex + 1] !== id) {
      console.table(selected.rows);
      console.log(`Nothing deleted. Run the same command with --confirm ${id} after reviewing the entry.`);
    } else {
      await pool.query("DELETE FROM guestbook_entries WHERE id = $1", [id]);
      console.log(`Deleted entry ${id}. The action is irreversible; use a database backup for recovery.`);
    }
  } else if (command === "cleanup") {
    const result = await pool.query("DELETE FROM submission_limits WHERE expires_at < now() AND ctid IN (SELECT ctid FROM submission_limits WHERE expires_at < now() LIMIT 500)");
    console.log(`Removed ${result.rowCount ?? 0} expired rate-limit buckets.`);
  } else {
    usage();
    process.exitCode = 1;
  }
} finally {
  await pool.end();
}
