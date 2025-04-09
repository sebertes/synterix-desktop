import {Resource} from "store/resource/Resource.svelte.js";
import Table from "components/Table.svelte";
import NamespaceDetailComponent from "components/detail/component/NamespaceDetailComponent.svelte";

export class Namespace extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getStatus() {
        const {status, metadata, spec} = this.raw;
        let statusString = "Unknown";
        let statusClass = "status-unknown";
        let statusDescription = "Namespace 状态未知，可能是由于集群通信问题或 API 服务器异常。";
        if (status && status.phase) {
            statusString = status.phase;
        }
        switch (statusString) {
            case "Active":
                statusClass = "status-active";
                statusDescription = "Namespace 处于正常运行状态，资源可正常创建和管理。";
                break;
            case "Terminating":
                statusClass = "status-terminating";
                statusDescription = "Namespace 正在被删除，但仍有资源未完全清理。";
                break;
            case "Failed":
                statusClass = "status-failed";
                statusDescription = "Namespace 创建或操作失败，可能是由于配额不足、权限问题或其他配置错误。";
                break;
            case "Pending":
                statusClass = "status-pending";
                statusDescription = "Namespace 正在创建中，但尚未完成，通常是由于集群资源不足或配置未完全生效。";
                break;
            case "Unknown":
                statusClass = "status-unknown";
                statusDescription = "Namespace 状态无法确定，可能是由于集群通信问题或 API 服务器异常。";
                break;
            case "NotReady":
                statusClass = "status-not-ready";
                statusDescription = "Namespace 未就绪，可能由于依赖资源未准备好。";
                break;
            case "Forbidden":
                statusClass = "status-forbidden";
                statusDescription = "当前用户无权访问该 Namespace，通常是由于 RBAC 配置限制。";
                break;
            case "QuotaExceeded":
                statusClass = "status-quota-exceeded";
                statusDescription = "Namespace 的资源使用超出了配额限制，需要调整资源配额或清理资源。";
                break;
            case "NamespaceNotExists":
                statusClass = "status-not-exists";
                statusDescription = "Namespace 不存在，可能是由于误删或未正确创建。";
                break;
            case "NamespaceConflict":
                statusClass = "status-conflict";
                statusDescription = "Namespace 名称冲突，可能是由于重复创建同名 Namespace。";
                break;
            case "NamespaceDeletionError":
                statusClass = "status-deletion-error";
                statusDescription = "Namespace 删除过程中出现错误，可能是由于资源未正确清理或依赖资源未释放。";
                break;
            case "NamespaceCreationError":
                statusClass = "status-creation-error";
                statusDescription = "Namespace 创建过程中出现错误，可能是由于配置错误或集群资源不足。";
                break;
            case "NamespaceLimitExceeded":
                statusClass = "status-limit-exceeded";
                statusDescription = "集群中 Namespace 数量已达到上限，需要调整集群配置或删除不必要的 Namespace。";
                break;
            case "NamespaceNotReady":
                statusClass = "status-not-ready";
                statusDescription = "Namespace 未就绪，可能由于依赖资源未准备好。";
                break;

            case "NamespaceUnavailable":
                statusClass = "status-unavailable";
                statusDescription = "Namespace 不可用，可能由于集群问题，如节点故障或网络问题。";
                break;

            case "NamespaceSuspended":
                statusClass = "status-suspended";
                statusDescription = "Namespace 被暂停，可能由于管理操作或系统自动暂停。";
                break;

            case "NamespaceInactive":
                statusClass = "status-inactive";
                statusDescription = "Namespace 处于非活跃状态，可能是由于长时间未使用或手动设置为非活跃状态。";
                break;

            case "NamespaceError":
                statusClass = "status-error";
                statusDescription = "Namespace 出现错误，状态异常，可能是由于配置错误或资源冲突。";
                break;

            case "NamespacePendingDeletion":
                statusClass = "status-pending-deletion";
                statusDescription = "Namespace 正在等待删除，可能是由于删除操作已发起，但尚未完成。";
                break;

            case "NamespacePendingCreation":
                statusClass = "status-pending-creation";
                statusDescription = "Namespace 正在等待创建，可能是由于创建操作已发起，但尚未完成。";
                break;

            default:
                statusClass = "status-unknown";
                statusDescription = "Namespace 状态未知，可能是由于集群通信问题或 API 服务器异常。";
                break;
        }

        return {
            status: statusString,
            className: statusClass,
            description: statusDescription,
        };
    }

    getTableRow() {
        let item = super.getTableRow();
        if (item.status.status !== 'Active' && item.status.description) {
            item.rowOption = {className: 'row-desc'};
            item.status.showDescription = true;
        }
        return item;
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left"},
            {name: "Age", key: "age", align: "right", width: "100px"}
        ];
    }

    getCreatable() {
        return {
            name: "Create",
            action: () => {
                console.log("Create");
            }
        };
    }

    getIntro(resource) {
        return [];
    }

    getDetailTabs(pod) {
        return [
            {
                id: "conditions",
                title: "Conditions",
                component: Table,
                params: {
                    header: [
                        {name: "Condition", key: "type", align: "left"},
                        {name: "Status", key: "status", align: "left"},
                        {name: "Updated", key: "lastTransitionTime", align: "left"},
                        {name: "Message", key: "message", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: pod.status.conditions || []
                }
            }
        ]
    }

    getDetailComponents(resourceKind) {
        return [
            {component: NamespaceDetailComponent, params: {namespace: resourceKind}}
        ];
    }
}